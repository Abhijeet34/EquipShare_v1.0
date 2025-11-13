const Request = require('../models/Request');
const Equipment = require('../models/Equipment');
const { notifyForMultipleEquipment } = require('./notificationService');

/**
 * Auto-expire pending requests older than 24 hours
 * Returns reserved inventory back to available pool
 */
const expirePendingRequests = async () => {
  try {
    const now = new Date();
    
    // Find all pending requests that have expired
    const expiredRequests = await Request.find({
      status: 'pending',
      expiresAt: { $lte: now }
    });

    if (expiredRequests.length === 0) {
      console.log(`[${now.toISOString()}] No expired requests found`);
      return { expired: 0 };
    }

    console.log(`[${now.toISOString()}] Found ${expiredRequests.length} expired request(s)`);
    
    let expiredCount = 0;
    const releasedEquipmentIds = new Set();
    
    for (const request of expiredRequests) {
      try {
        // Return reserved inventory for each item
        if (request.items && Array.isArray(request.items)) {
          for (const item of request.items) {
            if (item.status === 'pending') {
              const equipment = await Equipment.findById(item.equipment);
              if (equipment) {
              equipment.available += item.quantity;
              await equipment.save();
              releasedEquipmentIds.add(item.equipment.toString());
              console.log(`  - Returned ${item.quantity}x ${item.equipmentName} to inventory`);
              }
              item.status = 'expired';
            }
          }
        }
        
        // Update request status
        request.status = 'expired';
        request.expiredReason = 'Request was not approved within 24 hours. Please submit a new request if needed.';
        
        // Add to status history for audit trail
        request.statusHistory.push({
          status: 'expired',
          changedBy: request.user, // System action attributed to user
          changedAt: now,
          comment: 'Request automatically expired after 24 hours without admin action'
        });
        
        await request.save();
        expiredCount++;
        
        console.log(`  - Expired request ${request._id} for user ${request.user}`);
      } catch (err) {
        console.error(`  - Error expiring request ${request._id}:`, err.message);
      }
    }
    
    console.log(`[${now.toISOString()}] Successfully expired ${expiredCount}/${expiredRequests.length} request(s)`);
    
    // Notify users waiting for released equipment
    if (releasedEquipmentIds.size > 0) {
      notifyForMultipleEquipment(Array.from(releasedEquipmentIds)).catch(err => 
        console.error('Failed to send notifications:', err)
      );
    }
    
    return { expired: expiredCount, total: expiredRequests.length };
  } catch (error) {
    console.error('Error in expirePendingRequests:', error);
    throw error;
  }
};

/**
 * Start the cron job to run every 1 minute
 * Industry standard for time-sensitive operations
 * Maximum delay: 60 seconds (acceptable)
 */
const startExpirationCronJob = () => {
  const INTERVAL_MS = 1 * 60 * 1000; // 1 minute
  
  console.log('Starting request expiration cron job (runs every minute)');
  
  // Run immediately on startup
  expirePendingRequests().catch(err => 
    console.error('Initial expiration check failed:', err)
  );
  
  // Then run every minute for minimal delay
  setInterval(() => {
    expirePendingRequests().catch(err => 
      console.error('Scheduled expiration check failed:', err)
    );
  }, INTERVAL_MS);
};

module.exports = {
  expirePendingRequests,
  startExpirationCronJob
};
