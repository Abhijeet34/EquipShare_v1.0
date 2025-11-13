#!/usr/bin/env node

/**
 * Test Email Escalation Templates
 * 
 * This script sends test emails for each escalation level:
 * - Day 0: Friendly reminder
 * - Day 1: Polite reminder
 * - Day 3: Urgent notice
 * - Day 7+: Final notice
 * 
 * Usage:
 *   node scripts/testEscalationTemplates.js [test@example.com]
 */

const dotenv = require('dotenv');
const { sendOverdueReminder } = require('../utils/emailService');

dotenv.config();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  bold: '\x1b[1m'
};

const testEmail = process.argv[2] || 'test@example.com';

const escalationLevels = [
  {
    days: 0,
    name: 'Day 0 - Friendly Reminder',
    description: 'Due today - Gentle, helpful tone',
    color: colors.cyan
  },
  {
    days: 1,
    name: 'Day 1 - Polite Reminder',
    description: '1 day overdue - Understanding but encouraging',
    color: colors.yellow
  },
  {
    days: 3,
    name: 'Day 3 - Urgent Notice',
    description: '3 days overdue - Direct, escalated tone',
    color: colors.yellow + colors.bold
  },
  {
    days: 7,
    name: 'Day 7+ - Final Notice',
    description: '7+ days overdue - Firm, serious consequences',
    color: colors.red + colors.bold
  }
];

async function sendTestEmails() {
  console.log(`\n${colors.bold}${colors.cyan}========================================`);
  console.log(`   Email Escalation Template Test`);
  console.log(`========================================${colors.reset}\n`);
  
  console.log(`${colors.blue}ℹ${colors.reset} Sending test emails to: ${colors.bold}${testEmail}${colors.reset}\n`);
  
  console.log(`${colors.bold}Industry Best Practice Escalation:${colors.reset}\n`);

  let successCount = 0;
  let failCount = 0;

  for (const level of escalationLevels) {
    console.log(`${level.color}${level.name}${colors.reset}`);
    console.log(`  ${level.description}`);
    
    try {
      await sendOverdueReminder(testEmail, 'Test User', {
        equipmentName: `Test Equipment (${level.days} days)`,
        quantity: 2,
        dueDate: new Date(Date.now() - level.days * 24 * 60 * 60 * 1000),
        daysOverdue: level.days
      });
      
      console.log(`  ${colors.green}✓${colors.reset} Email sent successfully\n`);
      successCount++;
      
      // Delay to avoid Mailtrap rate limiting (free tier: max 2 emails/second)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
    } catch (error) {
      console.log(`  ${colors.red}✗${colors.reset} Failed: ${error.message}\n`);
      failCount++;
    }
  }

  console.log(`${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.bold}Summary:${colors.reset}`);
  console.log(`  ${colors.green}✓${colors.reset} Sent: ${successCount}`);
  if (failCount > 0) {
    console.log(`  ${colors.red}✗${colors.reset} Failed: ${failCount}`);
  }
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  console.log(`${colors.cyan}📧 Check your Mailtrap inbox:${colors.reset}`);
  console.log(`   https://mailtrap.io/inboxes\n`);
  
  console.log(`${colors.yellow}Note:${colors.reset} You should see 4 emails with different:${colors.reset}`);
  console.log(`  • Subject lines (icons and urgency)`);
  console.log(`  • Header colors (blue → orange → red)`);
  console.log(`  • Greeting styles (Hi → Dear)`);
  console.log(`  • Message tones (friendly → urgent → final)\n`);
}

sendTestEmails()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(`\n${colors.red}✗${colors.reset} Error:`, error.message);
    process.exit(1);
  });
