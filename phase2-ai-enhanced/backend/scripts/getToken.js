const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const generateToken = async (email) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.error(`Error: User with email '${email}' not found`);
      process.exit(1);
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );
    
    console.log('\n========================================');
    console.log('Authentication Token Generated');
    console.log('========================================');
    console.log(`User: ${user.name} (${user.email})`);
    console.log(`Role: ${user.role}`);
    console.log('\nToken:');
    console.log(token);
    console.log('\nCopy this token and paste it in Swagger UI\'s Authorize dialog');
    console.log('(Do NOT include "Bearer " prefix)');
    console.log('========================================\n');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('Usage: node getToken.js <email>');
  console.log('\nAvailable users:');
  console.log('  admin@school.com    (Admin)');
  console.log('  staff@school.com    (Staff)');
  console.log('  student1@school.com (Student)');
  console.log('  student2@school.com (Student)');
  process.exit(1);
}

generateToken(email);
