const mongoose = require('mongoose');
const Request = require('../models/Request');
const Equipment = require('../models/Equipment');
require('dotenv').config();

const migrateRequests = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/equipshare');
    console.log('Connected to MongoDB');

    // Find all requests that don't have equipmentName
    const requests = await Request.find({ 
      $or: [
        { equipmentName: { $exists: false } },
        { equipmentCategory: { $exists: false } }
      ]
    }).populate('equipment');

    console.log(`Found ${requests.length} requests to update`);

    let updated = 0;
    let failed = 0;

    for (const request of requests) {
      try {
        if (request.equipment) {
          // Equipment still exists
          request.equipmentName = request.equipment.name;
          request.equipmentCategory = request.equipment.category;
          await request.save();
          updated++;
          console.log(`✓ Updated request ${request._id} with equipment: ${request.equipment.name}`);
        } else {
          // Equipment was deleted - set fallback values
          request.equipmentName = 'Unknown Equipment';
          request.equipmentCategory = 'Other';
          await request.save();
          failed++;
          console.log(`⚠ Updated request ${request._id} with fallback (equipment deleted)`);
        }
      } catch (error) {
        console.error(`✗ Failed to update request ${request._id}:`, error.message);
        failed++;
      }
    }

    console.log('\nMigration complete:');
    console.log(`- Successfully updated: ${updated}`);
    console.log(`- Failed/Fallback: ${failed}`);
    console.log(`- Total: ${updated + failed}`);

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateRequests();
