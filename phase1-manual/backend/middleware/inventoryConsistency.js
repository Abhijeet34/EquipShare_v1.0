const Equipment = require('../models/Equipment');
const Request = require('../models/Request');

/**
 * Self-healing inventory consistency checker
 * Automatically detects and fixes orphaned reservations
 * Runs before equipment queries to ensure accurate availability
 */
async function checkAndFixInventoryConsistency(equipmentIds = null) {
  try {
    // Get equipment to check (all or specific IDs)
    const query = equipmentIds ? { _id: { $in: equipmentIds } } : {};
    const equipment = await Equipment.find(query);
    
    let fixedCount = 0;
    
    for (const item of equipment) {
      // Calculate actual reserved quantity from active requests
      const activeRequests = await Request.find({
        'items.equipment': item._id,
        'items.status': { $in: ['pending', 'approved'] }
      });
      
      let actuallyReserved = 0;
      activeRequests.forEach(request => {
        request.items.forEach(reqItem => {
          if (reqItem.equipment.toString() === item._id.toString() && 
              ['pending', 'approved'].includes(reqItem.status)) {
            actuallyReserved += reqItem.quantity;
          }
        });
      });
      
      const correctAvailable = item.quantity - actuallyReserved;
      
      // Auto-fix if inconsistent
      if (item.available !== correctAvailable) {
        console.log(`[AUTO-FIX] ${item.name}: ${item.available} → ${correctAvailable} available`);
        item.available = correctAvailable;
        await item.save();
        fixedCount++;
      }
    }
    
    return { checked: equipment.length, fixed: fixedCount };
  } catch (error) {
    console.error('Error in inventory consistency check:', error);
    return { checked: 0, fixed: 0, error: error.message };
  }
}

/**
 * Middleware to run consistency check before equipment routes
 * Only runs periodically to avoid performance impact
 */
let lastCheckTime = 0;
const CHECK_INTERVAL_MS = 5 * 60 * 1000; // Check every 5 minutes

async function inventoryConsistencyMiddleware(req, res, next) {
  const now = Date.now();
  
  // Only check if enough time has passed
  if (now - lastCheckTime > CHECK_INTERVAL_MS) {
    lastCheckTime = now;
    
    // Run async in background, don't block the request
    checkAndFixInventoryConsistency().catch(err => 
      console.error('Background inventory check failed:', err)
    );
  }
  
  next();
}

/**
 * On-demand consistency check for specific equipment
 * Used when serving equipment details or when suspecting issues
 */
async function checkEquipmentConsistency(equipmentId) {
  return await checkAndFixInventoryConsistency([equipmentId]);
}

module.exports = {
  inventoryConsistencyMiddleware,
  checkAndFixInventoryConsistency,
  checkEquipmentConsistency
};
