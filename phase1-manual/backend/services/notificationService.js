const EquipmentNotification = require('../models/EquipmentNotification');
const Equipment = require('../models/Equipment');

/**
 * Notify users when equipment becomes available
 * In a real app, this would send emails/SMS/push notifications
 * For now, we mark them as notified and log
 */
async function notifyUsersEquipmentAvailable(equipmentId) {
  try {
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment || equipment.available === 0) {
      return { notified: 0 };
    }

    // Find all pending notifications for this equipment
    const pendingNotifications = await EquipmentNotification.find({
      equipment: equipmentId,
      notified: false
    }).populate('user', 'name email');

    if (pendingNotifications.length === 0) {
      return { notified: 0 };
    }

    console.log(`\n[NOTIFICATION] ${equipment.name} is now available (${equipment.available} units)`);
    console.log(`   Notifying ${pendingNotifications.length} user(s):`);

    let notifiedCount = 0;
    const now = new Date();

    for (const notification of pendingNotifications) {
      try {
        // ** IN PRODUCTION: Send actual email/SMS/push notification here **
        // Examples:
        // - await sendEmail(notification.user.email, {...})
        // - await sendPushNotification(notification.user.id, {...})
        // - await sendSMS(notification.user.phone, {...})
        
        console.log(`   ✓ ${notification.user.name} (${notification.user.email})`);
        
        // Mark as notified
        notification.notified = true;
        notification.notifiedAt = now;
        await notification.save();
        
        notifiedCount++;
      } catch (err) {
        console.error(`   ✗ Failed to notify user ${notification.user.email}:`, err.message);
      }
    }

    console.log(`   Total notified: ${notifiedCount}/${pendingNotifications.length}\n`);

    return { notified: notifiedCount, total: pendingNotifications.length };
  } catch (error) {
    console.error('Error in notifyUsersEquipmentAvailable:', error);
    return { notified: 0, error: error.message };
  }
}

/**
 * Check and notify for multiple equipment items
 * Used when bulk inventory is released (e.g., multiple items in a request)
 */
async function notifyForMultipleEquipment(equipmentIds) {
  const results = [];
  
  for (const equipmentId of equipmentIds) {
    const result = await notifyUsersEquipmentAvailable(equipmentId);
    results.push({ equipmentId, ...result });
  }
  
  return results;
}

/**
 * Clean up old notified entries (optional maintenance)
 * Remove notifications that have been sent over 30 days ago
 */
async function cleanupOldNotifications() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await EquipmentNotification.deleteMany({
      notified: true,
      notifiedAt: { $lte: thirtyDaysAgo }
    });
    
    console.log(`[CLEANUP] Removed ${result.deletedCount} old notification(s)`);
    return result.deletedCount;
  } catch (error) {
    console.error('Error cleaning up notifications:', error);
    return 0;
  }
}

module.exports = {
  notifyUsersEquipmentAvailable,
  notifyForMultipleEquipment,
  cleanupOldNotifications
};
