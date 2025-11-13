const Equipment = require('../models/Equipment');

exports.getEquipment = async (req, res) => {
  try {
    const { category, search, available } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (available === 'true') {
      query.available = { $gt: 0 };
    }

    // Industry-standard sorting: available first, then alphabetically by name
    const equipment = await Equipment.find(query)
      .sort({ 
        available: -1,  // Items with stock first (descending)
        name: 1         // Then alphabetically (ascending)
      });
    res.status(200).json({ success: true, count: equipment.length, data: equipment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }
    res.status(200).json({ success: true, data: equipment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.create({
      ...req.body,
      available: req.body.quantity
    });
    res.status(201).json({ success: true, data: equipment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateEquipment = async (req, res) => {
  try {
    let equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }

    const oldQuantity = equipment.quantity;
    const borrowed = oldQuantity - equipment.available;

    if (req.body.quantity !== undefined) {
      req.body.available = req.body.quantity - borrowed;
      if (req.body.available < 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot reduce quantity below borrowed amount' 
        });
      }
    }

    equipment = await Equipment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: equipment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteEquipment = async (req, res) => {
  try {
    const Request = require('../models/Request');
    
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }

    // Check if equipment is currently borrowed
    if (equipment.available < equipment.quantity) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete equipment that is currently borrowed' 
      });
    }

    // Check for pending or approved requests
    const activeRequests = await Request.find({
      equipment: req.params.id,
      status: { $in: ['pending', 'approved'] }
    });

    if (activeRequests.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete equipment with ${activeRequests.length} pending/approved request(s)` 
      });
    }

    await equipment.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
