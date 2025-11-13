const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Equipment = require('./models/Equipment');
const Request = require('./models/Request');
const SupportMessage = require('./models/SupportMessage');

dotenv.config();

const users = [
  {
    name: 'Admin User',
    email: 'admin@school.com',
    password: 'Admin@123',
    role: 'admin'
  },
  {
    name: 'Staff Member',
    email: 'staff@school.com',
    password: 'Staff@123',
    role: 'staff'
  },
  {
    name: 'Student One',
    email: 'student1@school.com',
    password: 'Student@123',
    role: 'student'
  },
  {
    name: 'Student Two',
    email: 'student2@school.com',
    password: 'Student@123',
    role: 'student'
  }
];

const equipment = [
  {
    name: 'Basketball',
    category: 'Sports',
    condition: 'Good',
    quantity: 10,
    available: 10,
    description: 'Standard basketball for indoor/outdoor use'
  },
  {
    name: 'Microscope',
    category: 'Lab',
    condition: 'Excellent',
    quantity: 5,
    available: 5,
    description: 'Digital microscope for biology lab'
  },
  {
    name: 'DSLR Camera',
    category: 'Electronics',
    condition: 'Excellent',
    quantity: 3,
    available: 3,
    description: 'Canon DSLR camera with lens kit'
  },
  {
    name: 'Acoustic Guitar',
    category: 'Musical',
    condition: 'Good',
    quantity: 4,
    available: 4,
    description: 'Yamaha acoustic guitar'
  },
  {
    name: 'Football',
    category: 'Sports',
    condition: 'Fair',
    quantity: 8,
    available: 8,
    description: 'Standard football'
  },
  {
    name: 'Arduino Kit',
    category: 'Electronics',
    condition: 'Good',
    quantity: 15,
    available: 15,
    description: 'Arduino starter kit with sensors'
  },
  {
    name: 'Chemistry Set',
    category: 'Lab',
    condition: 'Good',
    quantity: 6,
    available: 6,
    description: 'Basic chemistry experiment set'
  },
  {
    name: 'Violin',
    category: 'Musical',
    condition: 'Excellent',
    quantity: 2,
    available: 2,
    description: 'Student violin with bow'
  },
  {
    name: 'Projector',
    category: 'Other',
    condition: 'Good',
    quantity: 4,
    available: 4,
    description: 'Portable LCD projector for presentations'
  },
  {
    name: 'Whiteboard',
    category: 'Other',
    condition: 'Excellent',
    quantity: 6,
    available: 6,
    description: 'Mobile whiteboard with stand'
  },
  {
    name: 'Extension Cable',
    category: 'Other',
    condition: 'Good',
    quantity: 12,
    available: 12,
    description: '10-meter power extension cable'
  },
  {
    name: 'Wireless Microphone',
    category: 'Other',
    condition: 'Excellent',
    quantity: 8,
    available: 8,
    description: 'Professional wireless microphone system for events'
  },
  {
    name: 'Laptop Stand',
    category: 'Other',
    condition: 'Good',
    quantity: 15,
    available: 15,
    description: 'Adjustable aluminum laptop stand for ergonomic setup'
  },
  {
    name: 'Document Scanner',
    category: 'Other',
    condition: 'Excellent',
    quantity: 3,
    available: 3,
    description: 'High-speed document scanner with auto-feed'
  },
  {
    name: 'Presentation Clicker',
    category: 'Other',
    condition: 'Good',
    quantity: 10,
    available: 10,
    description: 'Wireless presentation remote with laser pointer'
  },
  {
    name: 'Portable Speaker',
    category: 'Other',
    condition: 'Excellent',
    quantity: 7,
    available: 7,
    description: 'Bluetooth portable speaker for events and classes'
  },
  {
    name: 'Tripod Stand',
    category: 'Other',
    condition: 'Good',
    quantity: 5,
    available: 5,
    description: 'Professional camera/phone tripod with adjustable height'
  },
  {
    name: 'USB Hub',
    category: 'Other',
    condition: 'Good',
    quantity: 20,
    available: 20,
    description: '7-port powered USB hub for multiple device connections'
  }
];

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Delete all existing data for clean reseed
    console.log('Clearing existing data...');
    await Request.deleteMany();
    await SupportMessage.deleteMany();
    await User.deleteMany();
    await Equipment.deleteMany();
    console.log('Existing data cleared');

    // Insert fresh seed data
    console.log('Inserting seed data...');
    // Create users one by one to trigger pre-save middleware for password hashing
    for (const userData of users) {
      await User.create(userData);
    }
    await Equipment.insertMany(equipment);

    console.log('Data imported successfully');
    console.log('- Users:', users.length);
    console.log('- Equipment:', equipment.length);
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

importData();
