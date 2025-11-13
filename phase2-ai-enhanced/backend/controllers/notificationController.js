const EquipmentNotification = require('../models/EquipmentNotification');
const Equipment = require('../models/Equipment');

// Subscribe to notifications for equipment
exports.subscribe = async (req, res) => {
  try {
    const { equipmentId } = req.params;
    
    // Check if equipment exists
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }
    
    // Check if already subscribed
    const existing = await EquipmentNotification.findOne({
      user: req.user.id,
      equipment: equipmentId
    });
    
    if (existing) {
      return res.status(200).json({ 
        success: true, 
        message: 'Already subscribed',
        data: existing 
      });
    }
    
    // Create notification subscription
    const notification = await EquipmentNotification.create({
      user: req.user.id,
      equipment: equipmentId
    });
    
    res.status(201).json({ 
      success: true, 
      message: `You'll be notified when ${equipment.name} becomes available`,
      data: notification 
    });
  } catch (error) {
    console.error('Error subscribing to notification:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Unsubscribe from notifications
exports.unsubscribe = async (req, res) => {
  try {
    const { equipmentId } = req.params;
    
    const notification = await EquipmentNotification.findOneAndDelete({
      user: req.user.id,
      equipment: equipmentId
    });
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Unsubscribed successfully',
      data: {} 
    });
  } catch (error) {
    console.error('Error unsubscribing from notification:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check subscription status for specific equipment
exports.checkSubscription = async (req, res) => {
  try {
    const { equipmentId } = req.params;
    
    const notification = await EquipmentNotification.findOne({
      user: req.user.id,
      equipment: equipmentId
    });
    
    res.status(200).json({ 
      success: true, 
      subscribed: !!notification,
      data: notification 
    });
  } catch (error) {
    console.error('Error checking subscription:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all user's subscriptions
exports.getUserSubscriptions = async (req, res) => {
  try {
    const notifications = await EquipmentNotification.find({
      user: req.user.id
    })
    .populate('equipment', 'name category available quantity')
    .sort({ createdAt: -1 });
    
    res.status(200).json({ 
      success: true, 
      count: notifications.length,
      data: notifications 
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get subscriptions for bulk check (for equipment list page)
exports.bulkCheckSubscriptions = async (req, res) => {
  try {
    const { equipmentIds } = req.body;
    
    if (!equipmentIds || !Array.isArray(equipmentIds)) {
      return res.status(400).json({ success: false, message: 'equipmentIds array required' });
    }
    
    const notifications = await EquipmentNotification.find({
      user: req.user.id,
      equipment: { $in: equipmentIds }
    });
    
    // Return as map for easy lookup
    const subscriptionMap = {};
    notifications.forEach(notif => {
      subscriptionMap[notif.equipment.toString()] = true;
    });
    
    res.status(200).json({ 
      success: true, 
      data: subscriptionMap 
    });
  } catch (error) {
    console.error('Error bulk checking subscriptions:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
