#!/usr/bin/env node

/**
 * Demo Data Population Script
 * 
 * This script automatically populates the EquipShare database with comprehensive demo data
 * to showcase all features and functionalities without manual intervention.
 * 
 * Features:
 * - Seeds base data (users + equipment)
 * - Creates requests in various states (pending, approved, rejected)
 * - Generates overdue items for testing overdue management
 * - Creates returned items for analytics
 * - Simulates realistic usage patterns
 * - Bypasses reCAPTCHA for automated testing
 * 
 * Usage:
 *   node scripts/populateDemoData.js [--reset]
 *   
 * Options:
 *   --reset    Clear all existing data before populating
 */

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const dotenv = require('dotenv');
const User = require('../models/User');
const Equipment = require('../models/Equipment');
const Request = require('../models/Request');
const EquipmentNotification = require('../models/EquipmentNotification');

dotenv.config();

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001/api';
const RESET_DATA = process.argv.includes('--reset');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}\n${colors.bright}${msg}${colors.reset}\n${colors.cyan}${'='.repeat(60)}${colors.reset}\n`)
};

// Sleep utility for rate limiting
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Generate JWT token for a user
function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { 
    expiresIn: process.env.JWT_EXPIRE || '7d' 
  });
}

// Seed base data (users and equipment)
async function seedBaseData() {
  log.section('Step 1: Seeding Base Data');
  
  const users = [
    { name: 'Admin User', email: 'admin@school.com', password: 'Admin@123', role: 'admin' },
    { name: 'Staff Member', email: 'staff@school.com', password: 'Staff@123', role: 'staff' },
    { name: 'John Smith', email: 'student1@school.com', password: 'Student@123', role: 'student' },
    { name: 'Jane Williams', email: 'student2@school.com', password: 'Student@123', role: 'student' },
    { name: 'Michael Chen', email: 'student3@school.com', password: 'Student@123', role: 'student' }
  ];

  const equipment = [
    { name: 'Basketball', category: 'Sports', condition: 'Good', quantity: 10, available: 10, description: 'Standard basketball for indoor/outdoor use' },
    { name: 'Microscope', category: 'Lab', condition: 'Excellent', quantity: 5, available: 5, description: 'Digital microscope for biology lab' },
    { name: 'DSLR Camera', category: 'Electronics', condition: 'Excellent', quantity: 3, available: 3, description: 'Canon DSLR camera with lens kit' },
    { name: 'Acoustic Guitar', category: 'Musical', condition: 'Good', quantity: 4, available: 4, description: 'Yamaha acoustic guitar' },
    { name: 'Football', category: 'Sports', condition: 'Fair', quantity: 8, available: 8, description: 'Standard football' },
    { name: 'Arduino Kit', category: 'Electronics', condition: 'Good', quantity: 15, available: 15, description: 'Arduino starter kit with sensors' },
    { name: 'Chemistry Set', category: 'Lab', condition: 'Good', quantity: 6, available: 6, description: 'Basic chemistry experiment set' },
    { name: 'Violin', category: 'Musical', condition: 'Excellent', quantity: 2, available: 2, description: 'Student violin with bow' },
    { name: 'Projector', category: 'Other', condition: 'Good', quantity: 4, available: 4, description: 'Portable LCD projector' },
    { name: 'Whiteboard', category: 'Other', condition: 'Excellent', quantity: 6, available: 6, description: 'Mobile whiteboard with stand' },
    { name: 'Extension Cable', category: 'Other', condition: 'Good', quantity: 12, available: 12, description: '10-meter power extension cable' },
    { name: 'Wireless Microphone', category: 'Other', condition: 'Excellent', quantity: 8, available: 8, description: 'Professional wireless microphone' },
    { name: 'Laptop Stand', category: 'Other', condition: 'Good', quantity: 15, available: 15, description: 'Adjustable aluminum laptop stand' },
    { name: 'Document Scanner', category: 'Other', condition: 'Excellent', quantity: 3, available: 3, description: 'High-speed document scanner' },
    { name: 'Presentation Clicker', category: 'Other', condition: 'Good', quantity: 10, available: 10, description: 'Wireless presentation remote' },
    { name: 'Portable Speaker', category: 'Other', condition: 'Excellent', quantity: 7, available: 7, description: 'Bluetooth portable speaker' },
    { name: 'Tripod Stand', category: 'Other', condition: 'Good', quantity: 5, available: 5, description: 'Professional camera/phone tripod' },
    { name: 'USB Hub', category: 'Other', condition: 'Good', quantity: 20, available: 20, description: '7-port powered USB hub' },
    { name: 'VR Headset', category: 'Electronics', condition: 'Excellent', quantity: 2, available: 0, description: 'Oculus Quest VR headset - currently all borrowed' },
    { name: 'Studio Light Kit', category: 'Electronics', condition: 'Good', quantity: 1, available: 0, description: 'Professional photography lighting kit - out of stock' },
    { name: 'Digital Piano', category: 'Musical', condition: 'Excellent', quantity: 3, available: 1, description: 'Yamaha digital piano with weighted keys - low availability' }
  ];

  if (RESET_DATA) {
    log.info('Clearing existing data...');
    await Request.deleteMany({});
    await User.deleteMany({});
    await Equipment.deleteMany({});
    await EquipmentNotification.deleteMany({});
    await mongoose.connection.collection('counters').deleteMany({});
    log.success('Existing data cleared');
  }

  log.info(`Creating ${users.length} users...`);
  const createdUsers = {};
  for (const userData of users) {
    const user = await User.create(userData);
    createdUsers[userData.role === 'student' ? userData.email : userData.role] = user;
    log.success(`Created: ${user.name} (${user.role})`);
  }

  log.info(`Creating ${equipment.length} equipment items...`);
  const createdEquipment = [];
  for (const equipData of equipment) {
    const equip = await Equipment.create(equipData);
    createdEquipment.push(equip);
  }
  log.success(`Created ${createdEquipment.length} equipment items`);

  return { users: createdUsers, equipment: createdEquipment };
}

// Create pending requests
async function createPendingRequests(users, equipment) {
  log.section('Step 2: Creating Pending Requests');
  
  const student1 = users['student1@school.com'];
  const student2 = users['student2@school.com'];
  const student1Token = generateToken(student1._id);
  const student2Token = generateToken(student2._id);

  const pendingRequests = [
    {
      user: student1,
      token: student1Token,
      items: [
        { equipment: equipment[0]._id, quantity: 2, returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
      ],
      borrowDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      reason: 'Need basketballs for upcoming sports day practice session'
    },
    {
      user: student2,
      token: student2Token,
      items: [
        { equipment: equipment[6]._id, quantity: 1, returnDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) }
      ],
      borrowDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      reason: 'Required for chemistry project experiments in upcoming week'
    }
  ];

  for (const req of pendingRequests) {
    const request = await Request.create({
      user: req.user._id,
      items: req.items.map(item => ({
        equipment: item.equipment,
        equipmentName: equipment.find(e => e._id.equals(item.equipment)).name,
        equipmentCategory: equipment.find(e => e._id.equals(item.equipment)).category,
        quantity: item.quantity,
        returnDate: item.returnDate,
        status: 'pending'
      })),
      borrowDate: req.borrowDate,
      reason: req.reason,
      status: 'pending',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    // Reserve inventory
    for (const item of req.items) {
      const equip = await Equipment.findById(item.equipment);
      equip.available -= item.quantity;
      await equip.save();
    }

    log.success(`Created pending request ${request.requestId} for ${req.user.name}`);
  }
}

// Create approved requests
async function createApprovedRequests(users, equipment) {
  log.section('Step 3: Creating Approved Requests');
  
  const student1 = users['student1@school.com'];
  const student3 = users['student3@school.com'];
  const staff = users['staff'];

  const approvedRequests = [
    {
      user: student1._id,
      items: [
        { 
          equipment: equipment[1]._id, 
          equipmentName: equipment[1].name,
          equipmentCategory: equipment[1].category,
          quantity: 1, 
          returnDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          status: 'approved'
        }
      ],
      borrowDate: new Date(),
      reason: 'Biology project - observing cell structures for science fair',
      status: 'approved',
      approvedBy: staff._id
    },
    {
      user: student3._id,
      items: [
        { 
          equipment: equipment[3]._id,
          equipmentName: equipment[3].name,
          equipmentCategory: equipment[3].category,
          quantity: 1, 
          returnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          status: 'approved'
        },
        { 
          equipment: equipment[2]._id,
          equipmentName: equipment[2].name,
          equipmentCategory: equipment[2].category,
          quantity: 1, 
          returnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          status: 'approved'
        }
      ],
      borrowDate: new Date(),
      reason: 'Music department event preparation and documentation needed',
      status: 'approved',
      approvedBy: staff._id
    }
  ];

  for (const reqData of approvedRequests) {
    const request = await Request.create(reqData);

    // Reserve inventory
    for (const item of reqData.items) {
      const equip = await Equipment.findById(item.equipment);
      equip.available -= item.quantity;
      await equip.save();
    }

    const user = await User.findById(reqData.user);
    log.success(`Created approved request ${request.requestId} for ${user.name}`);
  }
}

// Create overdue requests
async function createOverdueRequests(users, equipment) {
  log.section('Step 4: Creating Overdue Requests');
  
  const student2 = users['student2@school.com'];
  const student3 = users['student3@school.com'];
  const staff = users['staff'];

  const overdueRequests = [
    {
      user: student2._id,
      items: [
        { 
          equipment: equipment[4]._id,
          equipmentName: equipment[4].name,
          equipmentCategory: equipment[4].category,
          quantity: 2, 
          returnDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days overdue
          status: 'approved'
        }
      ],
      borrowDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      reason: 'Football practice for inter-school tournament preparation',
      status: 'approved',
      approvedBy: staff._id
    },
    {
      user: student3._id,
      items: [
        { 
          equipment: equipment[5]._id,
          equipmentName: equipment[5].name,
          equipmentCategory: equipment[5].category,
          quantity: 3, 
          returnDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days overdue
          status: 'approved'
        }
      ],
      borrowDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      reason: 'Robotics club project - building automated systems',
      status: 'approved',
      approvedBy: staff._id
    },
    {
      user: student2._id,
      items: [
        { 
          equipment: equipment[8]._id,
          equipmentName: equipment[8].name,
          equipmentCategory: equipment[8].category,
          quantity: 1, 
          returnDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day overdue
          status: 'approved'
        }
      ],
      borrowDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      reason: 'Class presentation for final year project showcase',
      status: 'approved',
      approvedBy: staff._id
    },
  ];

  for (const reqData of overdueRequests) {
    const request = await Request.create(reqData);

    // Reserve inventory (accounting for partial returns)
    for (const item of reqData.items) {
      const equip = await Equipment.findById(item.equipment);
      equip.available -= item.quantity;
      await equip.save();
    }

    const user = await User.findById(reqData.user);
    const daysOverdue = Math.floor((Date.now() - reqData.items[0].returnDate) / (24 * 60 * 60 * 1000));
    log.warning(`Created overdue request ${request.requestId} for ${user.name} (${daysOverdue} days overdue)`);
  }
}

// Create returned requests for analytics
async function createReturnedRequests(users, equipment) {
  log.section('Step 5: Creating Returned Requests (Analytics Data)');
  
  const student1 = users['student1@school.com'];
  const student2 = users['student2@school.com'];
  const student3 = users['student3@school.com'];
  const staff = users['staff'];

  const returnedRequests = [
    {
      user: student1._id,
      items: [
        { 
          equipment: equipment[11]._id,
          equipmentName: equipment[11].name,
          equipmentCategory: equipment[11].category,
          quantity: 2, 
          returnDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          status: 'returned',
          actualReturnDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
        }
      ],
      borrowDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      reason: 'Annual day event - stage performance audio requirements',
      status: 'returned',
      approvedBy: staff._id,
      createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000)
    },
    {
      user: student2._id,
      items: [
        { 
          equipment: equipment[12]._id,
          equipmentName: equipment[12].name,
          equipmentCategory: equipment[12].category,
          quantity: 1, 
          returnDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          status: 'returned',
          actualReturnDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000)
        }
      ],
      borrowDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      reason: 'Online classes - ergonomic setup for remote learning',
      status: 'returned',
      approvedBy: staff._id,
      createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000)
    },
    {
      user: student3._id,
      items: [
        { 
          equipment: equipment[13]._id,
          equipmentName: equipment[13].name,
          equipmentCategory: equipment[13].category,
          quantity: 1, 
          returnDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          status: 'returned',
          actualReturnDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
        }
      ],
      borrowDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      reason: 'Digitizing old documents for school archive project',
      status: 'returned',
      approvedBy: staff._id,
      createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000)
    },
    {
      user: student1._id,
      items: [
        { 
          equipment: equipment[15]._id,
          equipmentName: equipment[15].name,
          equipmentCategory: equipment[15].category,
          quantity: 1, 
          returnDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          status: 'returned',
          actualReturnDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        { 
          equipment: equipment[16]._id,
          equipmentName: equipment[16].name,
          equipmentCategory: equipment[16].category,
          quantity: 1, 
          returnDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          status: 'returned',
          actualReturnDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        }
      ],
      borrowDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      reason: 'Video recording for school YouTube channel content',
      status: 'returned',
      approvedBy: staff._id,
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
    },
    {
      user: student2._id,
      items: [
        { 
          equipment: equipment[14]._id,
          equipmentName: equipment[14].name,
          equipmentCategory: equipment[14].category,
          quantity: 1, 
          returnDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          status: 'returned',
          actualReturnDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      ],
      borrowDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      reason: 'Final year project presentation to evaluation committee',
      status: 'returned',
      approvedBy: staff._id,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    }
  ];

  for (const reqData of returnedRequests) {
    const request = await Request.create(reqData);
    const user = await User.findById(reqData.user);
    log.success(`Created returned request ${request.requestId} for ${user.name}`);
  }
}

// Create notification subscriptions for out-of-stock items
async function createNotificationSubscriptions(users, equipment) {
  log.section('Step 6: Creating Notification Subscriptions (Out-of-Stock)');
  
  const student1 = users['student1@school.com'];
  const student2 = users['student2@school.com'];
  const student3 = users['student3@school.com'];
  
  // Find out-of-stock equipment (VR Headset, Studio Light Kit)
  const vrHeadset = equipment.find(e => e.name === 'VR Headset');
  const studioLightKit = equipment.find(e => e.name === 'Studio Light Kit');
  const digitalPiano = equipment.find(e => e.name === 'Digital Piano');
  
  const subscriptions = [
    {
      user: student1._id,
      equipment: vrHeadset._id,
      userName: student1.name,
      equipmentName: vrHeadset.name
    },
    {
      user: student2._id,
      equipment: vrHeadset._id,
      userName: student2.name,
      equipmentName: vrHeadset.name
    },
    {
      user: student3._id,
      equipment: studioLightKit._id,
      userName: student3.name,
      equipmentName: studioLightKit.name
    },
    {
      user: student1._id,
      equipment: digitalPiano._id,
      userName: student1.name,
      equipmentName: digitalPiano.name
    },
    {
      user: student2._id,
      equipment: studioLightKit._id,
      userName: student2.name,
      equipmentName: studioLightKit.name
    }
  ];
  
  for (const sub of subscriptions) {
    await EquipmentNotification.create({
      user: sub.user,
      equipment: sub.equipment,
      notified: false
    });
    log.success(`${sub.userName} subscribed to notifications for ${sub.equipmentName}`);
  }
  
  log.info(`Created ${subscriptions.length} notification subscriptions`);
}

// Create borrowed requests for out-of-stock equipment
async function createOutOfStockBorrowedRequests(users, equipment) {
  log.section('Step 7: Creating Borrowed Requests (Out-of-Stock Scenarios)');
  
  const student2 = users['student2@school.com'];
  const student3 = users['student3@school.com'];
  const staff = users['staff'];
  
  // Find out-of-stock equipment
  const vrHeadset = equipment.find(e => e.name === 'VR Headset');
  const studioLightKit = equipment.find(e => e.name === 'Studio Light Kit');
  const digitalPiano = equipment.find(e => e.name === 'Digital Piano');
  
  const borrowedRequests = [
    {
      user: student2._id,
      items: [
        { 
          equipment: vrHeadset._id,
          equipmentName: vrHeadset.name,
          equipmentCategory: vrHeadset.category,
          quantity: 2, // All VR headsets borrowed
          returnDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // Returns in 4 days
          status: 'approved'
        }
      ],
      borrowDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      reason: 'Virtual reality game development project for computer science course',
      status: 'approved',
      approvedBy: staff._id
    },
    {
      user: student3._id,
      items: [
        { 
          equipment: studioLightKit._id,
          equipmentName: studioLightKit.name,
          equipmentCategory: studioLightKit.category,
          quantity: 1, // Only studio light kit borrowed
          returnDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // Returns in 6 days
          status: 'approved'
        }
      ],
      borrowDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      reason: 'Photography club portfolio shoot for year-end exhibition',
      status: 'approved',
      approvedBy: staff._id
    },
    {
      user: student2._id,
      items: [
        { 
          equipment: digitalPiano._id,
          equipmentName: digitalPiano.name,
          equipmentCategory: digitalPiano.category,
          quantity: 2, // 2 of 3 digital pianos borrowed (1 remains available)
          returnDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // Returns in 10 days
          status: 'approved'
        }
      ],
      borrowDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      reason: 'Music recital practice for annual school concert performance',
      status: 'approved',
      approvedBy: staff._id
    }
  ];
  
  for (const reqData of borrowedRequests) {
    const request = await Request.create(reqData);
    const user = await User.findById(reqData.user);
    log.success(`Created borrowed request ${request.requestId} for ${user.name} (making ${reqData.items[0].equipmentName} unavailable)`);
  }
}

// Create rejected requests
async function createRejectedRequests(users, equipment) {
  log.section('Step 8: Creating Rejected Requests');
  
  const student3 = users['student3@school.com'];
  const staff = users['staff'];

  const rejectedRequests = [
    {
      user: student3._id,
      items: [
        { 
          equipment: equipment[7]._id,
          equipmentName: equipment[7].name,
          equipmentCategory: equipment[7].category,
          quantity: 2, 
          returnDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'rejected'
        }
      ],
      borrowDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      reason: 'Need for extended practice period for competition',
      status: 'rejected',
      rejectedBy: staff._id,
      rejectionReason: 'Request duration too long. Maximum allowed is 14 days. Please resubmit with shorter duration.',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    }
  ];

  for (const reqData of rejectedRequests) {
    const request = await Request.create(reqData);
    const user = await User.findById(reqData.user);
    log.warning(`Created rejected request ${request.requestId} for ${user.name}`);
  }
}


// Print summary
async function printSummary() {
  log.section('Demo Data Population Complete!');
  
  const stats = {
    users: await User.countDocuments(),
    equipment: await Equipment.countDocuments(),
    requests: await Request.countDocuments(),
    pending: await Request.countDocuments({ status: 'pending' }),
    approved: await Request.countDocuments({ status: 'approved' }),
    returned: await Request.countDocuments({ status: 'returned' }),
    rejected: await Request.countDocuments({ status: 'rejected' }),
    notifications: await EquipmentNotification.countDocuments(),
    outOfStock: await Equipment.countDocuments({ available: 0 })
  };

  console.log(`${colors.bright}Database Statistics:${colors.reset}`);
  console.log(`  Users:           ${stats.users}`);
  console.log(`  Equipment:       ${stats.equipment}`);
  console.log(`    - Out of Stock: ${stats.outOfStock}`);
  console.log(`  Total Requests:  ${stats.requests}`);
  console.log(`    - Pending:     ${stats.pending}`);
  console.log(`    - Approved:    ${stats.approved}`);
  console.log(`    - Returned:    ${stats.returned}`);
  console.log(`    - Rejected:    ${stats.rejected}`);
  console.log(`  Notifications:   ${stats.notifications} active subscriptions`);

  console.log(`\n${colors.bright}Test Credentials:${colors.reset}`);
  console.log(`  Admin:    admin@school.com / Admin@123`);
  console.log(`  Staff:    staff@school.com / Staff@123`);
  console.log(`  Student1: student1@school.com / Student@123`);
  console.log(`  Student2: student2@school.com / Student@123`);
  console.log(`  Student3: student3@school.com / Student@123`);

  console.log(`\n${colors.bright}What You Can Test:${colors.reset}`);
  console.log(`  ${colors.green}✓${colors.reset} View all equipment and filter by category`);
  console.log(`  ${colors.green}✓${colors.reset} Check pending requests (Student1, Student2)`);
  console.log(`  ${colors.green}✓${colors.reset} See approved requests in different stages`);
  console.log(`  ${colors.green}✓${colors.reset} View overdue items (Admin/Staff dashboard)`);
  console.log(`  ${colors.green}✓${colors.reset} Check analytics with returned items data`);
  console.log(`  ${colors.green}✓${colors.reset} View request history and status changes`);
  console.log(`  ${colors.green}✓${colors.reset} Create new requests with available equipment`);
  console.log(`  ${colors.green}✓${colors.reset} Approve/Reject pending requests (Staff/Admin)`);
  console.log(`  ${colors.green}✓${colors.reset} Process returns and update inventory`);
  console.log(`  ${colors.yellow}✓${colors.reset} Test out-of-stock scenarios (VR Headset, Studio Light Kit)`);
  console.log(`  ${colors.yellow}✓${colors.reset} Subscribe to notifications for unavailable equipment`);
  console.log(`  ${colors.yellow}✓${colors.reset} Receive notifications when items become available`);

  console.log(`\n${colors.bright}Quick Actions:${colors.reset}`);
  console.log(`  Generate token:  node scripts/getToken.js <email>`);
  console.log(`  Reset & reseed:  node scripts/populateDemoData.js --reset`);
  console.log(`  Start app:       ./manage.sh start`);

  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
}

// Main execution
async function main() {
  try {
    console.log(`\n${colors.bright}${colors.blue}EquipShare Demo Data Population Script${colors.reset}\n`);
    
    log.info('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    log.success('Connected to MongoDB');

    const { users, equipment } = await seedBaseData();
    await createPendingRequests(users, equipment);
    await createApprovedRequests(users, equipment);
    await createOverdueRequests(users, equipment);
    await createReturnedRequests(users, equipment);
    await createNotificationSubscriptions(users, equipment);
    await createOutOfStockBorrowedRequests(users, equipment);
    await createRejectedRequests(users, equipment);
    await printSummary();

    await mongoose.connection.close();
    log.success('Database connection closed');
    
    process.exit(0);
  } catch (error) {
    log.error(`Error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

main();
