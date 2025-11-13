const mongoose = require('mongoose');

const equipmentNotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: true
  },
  notified: {
    type: Boolean,
    default: false
  },
  notifiedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to prevent duplicate subscriptions
equipmentNotificationSchema.index({ user: 1, equipment: 1 }, { unique: true });

// Index for efficient queries
equipmentNotificationSchema.index({ equipment: 1, notified: 1 });

module.exports = mongoose.model('EquipmentNotification', equipmentNotificationSchema);
