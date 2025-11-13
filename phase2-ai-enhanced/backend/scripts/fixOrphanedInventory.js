const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Equipment = require('../models/Equipment');
const Request = require('../models/Request');

dotenv.config();

/**
 * Fix orphaned inventory reservations
 * This happens when requests are deleted without returning inventory
 * 
 * Strategy:
 * 1. Calculate ACTUAL reserved quantities from active requests
 * 2. Set available = quantity - actuallyReserved
 */
async function fixOrphanedInventory() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected\n');

    const allEquipment = await Equipment.find({});
    console.log(`Found ${allEquipment.length} equipment items\n`);

    let fixedCount = 0;

    for (const equipment of allEquipment) {
      // Calculate how much is ACTUALLY reserved in pending/approved requests
      const activeRequests = await Request.find({
        'items.equipment': equipment._id,
        'items.status': { $in: ['pending', 'approved'] }
      });

      let actuallyReserved = 0;
      activeRequests.forEach(request => {
        request.items.forEach(item => {
          if (item.equipment.toString() === equipment._id.toString() && 
              ['pending', 'approved'].includes(item.status)) {
            actuallyReserved += item.quantity;
          }
        });
      });

      const correctAvailable = equipment.quantity - actuallyReserved;

      if (equipment.available !== correctAvailable) {
        console.log(`${equipment.name}:`);
        console.log(`  Current available: ${equipment.available}`);
        console.log(`  Actually reserved: ${actuallyReserved}`);
        console.log(`  Correct available: ${correctAvailable}`);
        console.log(`  → Fixing...`);

        equipment.available = correctAvailable;
        await equipment.save();
        fixedCount++;
      }
    }

    console.log(`\n${'='.repeat(50)}`);
    if (fixedCount === 0) {
      console.log('✓ All inventory levels are correct!');
    } else {
      console.log(`✓ Fixed ${fixedCount} equipment item(s)`);
    }
    console.log(`${'='.repeat(50)}\n`);

    await mongoose.connection.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Fix failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run fix
console.log('='.repeat(60));
console.log('FIXING ORPHANED INVENTORY RESERVATIONS');
console.log('='.repeat(60));
fixOrphanedInventory();
