const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Request = require('../models/Request');
const Equipment = require('../models/Equipment');

dotenv.config();

/**
 * Migration script to update existing pending requests with:
 * 1. expiresAt field (24 hours from now)
 * 2. Reserve inventory for pending requests
 */
async function migrateExistingRequests() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    // Find all pending requests without expiresAt
    const pendingRequests = await Request.find({
      status: 'pending',
      expiresAt: { $exists: false }
    });

    console.log(`Found ${pendingRequests.length} pending request(s) to migrate`);

    if (pendingRequests.length === 0) {
      console.log('No requests to migrate. Exiting.');
      await mongoose.connection.close();
      return;
    }

    let migratedCount = 0;
    let errorCount = 0;

    for (const request of pendingRequests) {
      try {
        console.log(`\nMigrating request ${request._id}...`);

        // Set expiration to 24 hours from now
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        request.expiresAt = expiresAt;

        // Reserve inventory for each item
        if (request.items && Array.isArray(request.items)) {
          for (const item of request.items) {
            if (item.status === 'pending') {
              const equipment = await Equipment.findById(item.equipment);
              if (equipment) {
                // Check if enough inventory available
                if (equipment.available >= item.quantity) {
                  equipment.available -= item.quantity;
                  await equipment.save();
                  console.log(`  ✓ Reserved ${item.quantity}x ${item.equipmentName} (${equipment.available} remaining)`);
                } else {
                  console.log(`  ⚠ Insufficient inventory for ${item.equipmentName} (need ${item.quantity}, have ${equipment.available})`);
                  console.log(`    Marking request as expired due to insufficient inventory`);
                  request.status = 'expired';
                  request.expiresAt = null;
                  item.status = 'expired';
                  
                  // Add to status history
                  request.statusHistory.push({
                    status: 'expired',
                    changedBy: request.user,
                    changedAt: new Date(),
                    comment: 'Expired during migration due to insufficient inventory'
                  });
                  break; // Skip rest of items for this request
                }
              }
            }
          }
        }

        await request.save();
        migratedCount++;
        console.log(`  ✓ Migrated successfully`);

      } catch (err) {
        console.error(`  ✗ Error migrating request ${request._id}:`, err.message);
        errorCount++;
      }
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`Migration complete!`);
    console.log(`  Successfully migrated: ${migratedCount}`);
    console.log(`  Errors: ${errorCount}`);
    console.log(`  Total: ${pendingRequests.length}`);
    console.log(`${'='.repeat(50)}\n`);

    await mongoose.connection.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Migration failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run migration
migrateExistingRequests();
