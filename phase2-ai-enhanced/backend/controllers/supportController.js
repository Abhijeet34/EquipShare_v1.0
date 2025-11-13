const SupportMessage = require('../models/SupportMessage');

// @desc    Send a support message
// @route   POST /api/support/contact
// @access  Public
exports.sendMessage = async (req, res) => {
  try {
    const { name, email, subject, message, priority } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check for duplicate messages within the last 24 hours
    const duplicateWindow = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    
    const existingMessage = await SupportMessage.findOne({
      email: email.toLowerCase().trim(),
      subject: subject.trim(),
      message: message.trim(),
      createdAt: { $gte: duplicateWindow }
    }).sort({ createdAt: -1 }); // Get the most recent duplicate

    let supportMessage;
    let isReplacement = false;

    if (existingMessage) {
      // Delete the old duplicate message
      await SupportMessage.findByIdAndDelete(existingMessage._id);
      
      console.log('Duplicate message detected and purged:', {
        oldId: existingMessage._id,
        email: email,
        originalCreatedAt: existingMessage.createdAt
      });
      
      isReplacement = true;
    }

    // Create new support message (either fresh or replacement)
    supportMessage = await SupportMessage.create({
      name,
      email,
      subject,
      message,
      priority: priority || 'normal'
    });

    // In a real application, you would:
    // 1. Send email notification to support team
    // 2. Send auto-reply confirmation to user
    // 3. Create ticket in support system
    // 4. Log to monitoring system
    
    console.log(`${isReplacement ? 'Replacement' : 'New'} support message received:`, {
      id: supportMessage._id,
      from: email,
      subject: subject,
      priority: supportMessage.priority,
      createdAt: supportMessage.createdAt,
      isReplacement
    });

    res.status(201).json({
      success: true,
      message: isReplacement 
        ? 'Your previous message has been updated. We will get back to you shortly.'
        : 'Your message has been received. We will get back to you shortly.',
      data: {
        id: supportMessage._id,
        createdAt: supportMessage.createdAt,
        updatedAt: supportMessage.updatedAt,
        isReplacement
      }
    });
  } catch (error) {
    console.error('Error sending support message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all support messages (Admin only)
// @route   GET /api/support/messages
// @access  Private/Admin
exports.getAllMessages = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const messages = await SupportMessage.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('assignedTo', 'name email');

    const total = await SupportMessage.countDocuments(query);

    res.status(200).json({
      success: true,
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching support messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update support message status (Admin only)
// @route   PUT /api/support/messages/:id
// @access  Private/Admin
exports.updateMessage = async (req, res) => {
  try {
    const { status, response, assignedTo } = req.body;
    
    const updateData = {};
    if (status) updateData.status = status;
    if (response) {
      updateData.response = response;
      updateData.respondedAt = new Date();
    }
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;

    const message = await SupportMessage.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Support message not found'
      });
    }

    res.status(200).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error updating support message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single support message (Admin only)
// @route   GET /api/support/messages/:id
// @access  Private/Admin
exports.getMessage = async (req, res) => {
  try {
    const message = await SupportMessage.findById(req.params.id)
      .populate('assignedTo', 'name email');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Support message not found'
      });
    }

    res.status(200).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error fetching support message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
