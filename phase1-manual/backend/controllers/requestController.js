const Request = require('../models/Request');
const Equipment = require('../models/Equipment');
const { notifyForMultipleEquipment } = require('../services/notificationService');

exports.getRequests = async (req, res) => {
  try {
    let query = {};
    
    // Students can only see their own requests
    if (req.user.role === 'student') {
      query.user = req.user.id;
    }
    
    // Staff can only see actionable requests (not rejected or full history)
    // Admin has full visibility for oversight purposes
    if (req.user.role === 'staff') {
      query.status = { $in: ['pending', 'approved', 'returned'] };
    }

    const requests = await Request.find(query)
      .populate('user', 'name email role')
      .populate('items.equipment', 'name category')
      .populate('approvedBy', 'name email')
      .populate('rejectedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('user', 'name email role')
      .populate('items.equipment', 'name category')
      .populate('approvedBy', 'name email')
      .populate('rejectedBy', 'name email')
      .populate('statusHistory.changedBy', 'name email');

    // Return 404 for both non-existent and unauthorized requests
    // This prevents information disclosure about request existence
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (req.user.role === 'student' && request.user._id.toString() !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    
    // Staff can only see actionable requests (privacy protection)
    if (req.user.role === 'staff' && request.status === 'rejected') {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createRequest = async (req, res) => {
  try {
    const { items, borrowDate, reason } = req.body;
    console.log('Received request with items:', JSON.stringify(items, null, 2));

    // Validate items array
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please add at least one item to your request' 
      });
    }

    // Validate borrow date - no backdating
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today
    const borrow = new Date(borrowDate);
    borrow.setHours(0, 0, 0, 0);
    
    if (borrow < now) {
      return res.status(400).json({ 
        success: false, 
        message: 'Borrow date cannot be in the past' 
      });
    }

    // Process and validate each item
    const processedItems = [];
    const availabilityErrors = [];

    for (const item of items) {
      const { equipment: equipmentId, quantity, returnDate } = item;
      console.log('Processing item:', { equipmentId, quantity, returnDate });

      // Find equipment
      const equipment = await Equipment.findById(equipmentId);
      console.log('Found equipment:', equipment ? `${equipment.name} (${equipment.available} available)` : 'NULL');
      if (!equipment) {
        availabilityErrors.push(`Equipment not found`);
        continue;
      }

      // Validate quantity
      if (equipment.available < quantity) {
        availabilityErrors.push(
          `${equipment.name}: Only ${equipment.available} unit(s) available`
        );
        continue;
      }

      // Validate return date
      const returnD = new Date(returnDate);
      returnD.setHours(0, 0, 0, 0);
      
      if (returnD <= borrow) {
        availabilityErrors.push(
          `${equipment.name}: Return date must be after borrow date`
        );
        continue;
      }

      // Check for overlapping bookings
      const overlapping = await Request.find({
        'items.equipment': equipmentId,
        'items.status': { $in: ['pending', 'approved'] },
        $or: [
          {
            borrowDate: { $lte: returnD },
            'items.returnDate': { $gte: borrow }
          }
        ]
      });

      let bookedQuantity = 0;
      overlapping.forEach(req => {
        // Handle new schema (items array)
        if (req.items && Array.isArray(req.items)) {
          req.items.forEach(reqItem => {
            if (reqItem.equipment && reqItem.equipment.toString() === equipmentId && 
                ['pending', 'approved'].includes(reqItem.status)) {
              bookedQuantity += reqItem.quantity;
            }
          });
        }
        // Handle old schema (single equipment field) - for backward compatibility
        else if (req.equipment && req.equipment.toString() === equipmentId) {
          bookedQuantity += req.quantity || 0;
        }
      });

      const availableForDates = equipment.available - bookedQuantity;
      if (availableForDates < quantity) {
        availabilityErrors.push(
          `${equipment.name}: Only ${availableForDates} unit(s) available for selected dates`
        );
        continue;
      }

      // Add to processed items
      processedItems.push({
        equipment: equipmentId,
        equipmentName: equipment.name,
        equipmentCategory: equipment.category,
        quantity,
        returnDate,
        status: 'pending'
      });
    }

    // Check if all items failed validation
    if (availabilityErrors.length > 0 && processedItems.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Unable to process request',
        errors: availabilityErrors
      });
    }

    // Soft reserve inventory for pending requests
    for (const item of processedItems) {
      const equipment = await Equipment.findById(item.equipment);
      if (equipment) {
        equipment.available -= item.quantity;
        await equipment.save();
      }
    }

    // Set expiration time (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Create the request
    console.log('Creating request with data:', {
      user: req.user.id,
      itemsCount: processedItems.length,
      borrowDate,
      reason: reason || 'MISSING',
      status: 'pending',
      expiresAt
    });
    
    const request = await Request.create({
      user: req.user.id,
      items: processedItems,
      borrowDate,
      reason,
      status: 'pending',
      expiresAt
    });
    
    console.log('Request created successfully:', request._id);

    const populatedRequest = await Request.findById(request._id)
      .populate('user', 'name email role')
      .populate('items.equipment', 'name category');

    res.status(201).json({ 
      success: true, 
      data: populatedRequest,
      warnings: availabilityErrors.length > 0 ? availabilityErrors : undefined
    });
  } catch (error) {
    console.error('Error creating request:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { status, comment, rejectionReason, approvalNote } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const oldStatus = request.status;

    if (status === 'approved') {
      // Inventory already reserved during request creation (soft reservation)
      // Just mark items as approved
      if (request.items && Array.isArray(request.items)) {
        for (const item of request.items) {
          item.status = 'approved';
        }
      }
      request.approvedBy = req.user.id;
      if (approvalNote) {
        request.approvalNote = approvalNote;
      }
      request.expiresAt = null; // Clear expiration once approved
    }

    if (status === 'rejected') {
      // Track who rejected the request for accountability
      request.rejectedBy = req.user.id;
      request.rejectionReason = rejectionReason || 'No reason provided';
      request.expiresAt = null; // Clear expiration
      
      // Return reserved inventory (whether pending or approved)
      const releasedEquipmentIds = [];
      if (request.items && Array.isArray(request.items)) {
        for (const item of request.items) {
          if (['pending', 'approved'].includes(item.status)) {
            const equipment = await Equipment.findById(item.equipment);
            if (equipment) {
              equipment.available += item.quantity;
              await equipment.save();
              releasedEquipmentIds.push(item.equipment);
            }
            item.status = 'rejected';
          }
        }
      }
      // Handle old single-item requests for backward compatibility
      else if (request.equipment) {
        const equipment = await Equipment.findById(request.equipment);
        if (equipment) {
          equipment.available += request.quantity;
          await equipment.save();
          releasedEquipmentIds.push(request.equipment);
        }
      }
      
      // Notify users waiting for this equipment
      if (releasedEquipmentIds.length > 0) {
        notifyForMultipleEquipment(releasedEquipmentIds).catch(err => 
          console.error('Failed to send notifications:', err)
        );
      }
    }

    if (status === 'returned') {
      // Handle multi-item requests
      const releasedEquipmentIds = [];
      const returnDate = new Date();
      
      if (request.items && Array.isArray(request.items)) {
        for (const item of request.items) {
          if (item.status === 'approved') {
            const equipment = await Equipment.findById(item.equipment);
            if (equipment) {
              equipment.available += item.quantity;
              await equipment.save();
              releasedEquipmentIds.push(item.equipment);
            }
            item.status = 'returned';
            item.actualReturnDate = returnDate; // Set actual return date for each item
          }
        }
      }
      // Handle old single-item requests
      else if (request.equipment) {
        const equipment = await Equipment.findById(request.equipment);
        if (equipment) {
          equipment.available += request.quantity;
          await equipment.save();
          releasedEquipmentIds.push(request.equipment);
        }
      }
      request.actualReturnDate = returnDate;
      
      // Notify users waiting for this equipment
      if (releasedEquipmentIds.length > 0) {
        notifyForMultipleEquipment(releasedEquipmentIds).catch(err => 
          console.error('Failed to send notifications:', err)
        );
      }
    }

    // Add status change to audit trail
    request.statusHistory.push({
      status: status,
      changedBy: req.user.id,
      changedAt: new Date(),
      comment: comment || `Status changed from ${oldStatus} to ${status}`
    });

    request.status = status;
    await request.save();

    const updatedRequest = await Request.findById(request._id)
      .populate('user', 'name email role')
      .populate('items.equipment', 'name category')
      .populate('approvedBy', 'name email')
      .populate('rejectedBy', 'name email')
      .populate('statusHistory.changedBy', 'name email');

    res.status(200).json({ success: true, data: updatedRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    // Return 404 for both non-existent and unauthorized requests
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (req.user.role === 'student' && request.user.toString() !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.status === 'approved') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete approved request' 
      });
    }

    await request.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
