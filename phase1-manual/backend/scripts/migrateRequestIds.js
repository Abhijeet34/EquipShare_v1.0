const mongoose = require('mongoose');
const Request = require('../models/Request');
require('dotenv').config();

const migrateRequestIds = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all requests without requestId
    const requests = await Request.find({ requestId: { $exists: false } }).sort({ createdAt: 1 });
    console.log(`Found ${requests.length} requests without requestId`);

    if (requests.length === 0) {
      console.log('All requests already have requestId. Migration not needed.');
      process.exit(0);
    }

    let counter = 1;
    
    for (const request of requests) {
      request.requestId = `REQ-${String(counter).padStart(6, '0')}`;
      await request.save();
      console.log(`✓ Assigned ${request.requestId} to request ${request._id}`);
      counter++;
    }

    // Update the counter collection to match
    const Counter = mongoose.model('Counter', new mongoose.Schema({
      _id: { type: String, required: true },
      seq: { type: Number, default: 0 }
    }));
    
    await Counter.findByIdAndUpdate(
      { _id: 'requestId' },
      { $set: { seq: counter - 1 } },
      { upsert: true }
    );

    console.log(`\n✓ Migration complete! Updated ${requests.length} requests.`);
    console.log(`✓ Counter set to ${counter - 1}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateRequestIds();
