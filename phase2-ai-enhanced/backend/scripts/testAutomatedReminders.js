#!/usr/bin/env node

/**
 * Test Automated Overdue Reminder System
 * 
 * This script manually triggers the automated reminder check
 * to test the reminder service without waiting for the cron schedule.
 * 
 * Usage:
 *   node scripts/testAutomatedReminders.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { checkAndSendReminders, shouldSendReminder } = require('../services/overdueReminderService');
const Request = require('../models/Request');
const User = require('../models/User');
const Equipment = require('../models/Equipment');

dotenv.config();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  bold: '\x1b[1m'
};

async function main() {
  console.log(`\n${colors.bold}${colors.cyan}========================================`);
  console.log(`   Automated Reminder System Test`);
  console.log(`========================================${colors.reset}\n`);

  try {
    // Connect to MongoDB
    console.log(`${colors.blue}ℹ${colors.reset} Connecting to MongoDB...`);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`${colors.green}✓${colors.reset} Connected to MongoDB\n`);

    // Show current overdue items
    console.log(`${colors.bold}Current Overdue Status:${colors.reset}`);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const overdueRequests = await Request.find({
      status: { $in: ['approved', 'overdue'] },
      'items.status': { $in: ['approved', 'overdue'] }
    })
      .populate('user', 'name email')
      .populate('items.equipment', 'name');

    let totalOverdue = 0;
    const reminderSchedule = [];

    for (const request of overdueRequests) {
      if (!request.user) continue;

      const overdueItems = request.items.filter(item => {
        const returnDate = new Date(item.returnDate);
        returnDate.setHours(0, 0, 0, 0);
        return ['approved', 'overdue'].includes(item.status) && returnDate < now;
      });

      for (const item of overdueItems) {
        totalOverdue++;
        const returnDate = new Date(item.returnDate);
        returnDate.setHours(0, 0, 0, 0);
        const daysOverdue = Math.floor((now - returnDate) / (1000 * 60 * 60 * 24));
        const willSendReminder = shouldSendReminder(daysOverdue);

        const status = willSendReminder ? `${colors.green}✓ Will send${colors.reset}` : `${colors.yellow}○ Will skip${colors.reset}`;
        
        console.log(`  ${status} - ${request.user.name} (${request.user.email})`);
        console.log(`     Equipment: ${item.equipment?.name || item.equipmentName}`);
        console.log(`     Days Overdue: ${daysOverdue}`);
        console.log(``);

        if (willSendReminder) {
          reminderSchedule.push({
            user: request.user.name,
            email: request.user.email,
            equipment: item.equipment?.name || item.equipmentName,
            daysOverdue
          });
        }
      }
    }

    if (totalOverdue === 0) {
      console.log(`  ${colors.green}✓${colors.reset} No overdue items found\n`);
    } else {
      console.log(`${colors.bold}Summary:${colors.reset}`);
      console.log(`  Total overdue items: ${totalOverdue}`);
      console.log(`  Reminders to send: ${reminderSchedule.length}\n`);
    }

    // Reminder schedule logic
    console.log(`${colors.bold}Reminder Schedule (Industry Best Practice):${colors.reset}`);
    console.log(`  ${colors.cyan}Day 0${colors.reset}  - Due date reminder (gentle nudge)`);
    console.log(`  ${colors.yellow}Day 1${colors.reset}  - First overdue notification`);
    console.log(`  ${colors.yellow}Day 3${colors.reset}  - Escalation reminder`);
    console.log(`  ${colors.red}Day 7${colors.reset}  - Final notice`);
    console.log(`  ${colors.red}Day 14+${colors.reset} - Weekly reminders (every 7 days)\n`);

    // Trigger manual check
    if (reminderSchedule.length > 0) {
      console.log(`${colors.bold}${colors.blue}Triggering manual reminder check...${colors.reset}\n`);
      await checkAndSendReminders();
      console.log(`\n${colors.green}✓${colors.reset} Manual reminder check complete!`);
      console.log(`\n${colors.cyan}📧 Check your Mailtrap inbox:${colors.reset}`);
      console.log(`   https://mailtrap.io/inboxes\n`);
    } else {
      console.log(`${colors.yellow}⚠${colors.reset} No reminders to send at this time.\n`);
    }

    console.log(`${colors.bold}Cron Schedule Configuration:${colors.reset}`);
    console.log(`  Current: ${process.env.REMINDER_CRON_SCHEDULE || '0 9 * * *'} (Every day at 9:00 AM)`);
    console.log(`  Change in .env: REMINDER_CRON_SCHEDULE="0 9 * * *"\n`);

    console.log(`${colors.cyan}========================================${colors.reset}`);
    console.log(`${colors.green}   Automated reminder test complete!${colors.reset}`);
    console.log(`${colors.cyan}========================================${colors.reset}\n`);

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error(`\n${colors.red}✗${colors.reset} Error:`, error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
