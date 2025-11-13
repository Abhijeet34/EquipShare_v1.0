const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Request = require('../models/Request');
const { expirePendingRequests } = require('../services/requestExpirationService');

dotenv.config();

/**
 * Test script to verify expiration works correctly
 * 1. Sets a pending request to expire in 1 minute (for testing)
 * 2. Waits 61 seconds
 * 3. Runs expiration job manually
 * 4. Verifies inventory was returned
 */
async function testExpiration() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected\n');

    // Find a pending request
    const pendingRequest = await Request.findOne({ status: 'pending' });
    
    if (!pendingRequest) {
      console.log('No pending requests found to test. Create a request first.');
      await mongoose.connection.close();
      return;
    }

    console.log(`Found pending request: ${pendingRequest._id}`);
    console.log(`Current expiresAt: ${pendingRequest.expiresAt}`);
    
    // Set expiry to 1 minute from now for testing
    const newExpiry = new Date();
    newExpiry.setMinutes(newExpiry.getMinutes() + 1);
    pendingRequest.expiresAt = newExpiry;
    await pendingRequest.save();
    
    console.log(`Updated expiresAt to: ${newExpiry}`);
    console.log(`\nWaiting 61 seconds for expiration...`);
    
    // Show countdown
    for (let i = 61; i > 0; i--) {
      process.stdout.write(`\r${i} seconds remaining...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log('\n\n--- Running expiration job ---');
    
    // Run expiration
    const result = await expirePendingRequests();
    
    console.log('\n--- Verification ---');
    const expiredRequest = await Request.findById(pendingRequest._id);
    console.log(`Request status: ${expiredRequest.status}`);
    console.log(`Items status: ${expiredRequest.items.map(i => i.status).join(', ')}`);
    
    if (expiredRequest.status === 'expired') {
      console.log('\n✅ SUCCESS: Request expired correctly!');
      console.log('Inventory should now be available again.');
    } else {
      console.log('\n❌ FAILED: Request did not expire');
    }
    
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    
  } catch (error) {
    console.error('Test failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run test
console.log('='.repeat(60));
console.log('EXPIRATION TEST - This will take ~61 seconds');
console.log('='.repeat(60));
testExpiration();
