#!/usr/bin/env node

/**
 * Email Configuration Test Script
 * 
 * Tests your Mailtrap email configuration
 * Run: node scripts/testEmail.js
 */

const dotenv = require('dotenv');
const { sendOverdueReminder, verifyEmailConfig } = require('../utils/emailService');

dotenv.config();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

async function testEmailSetup() {
  console.log(`\n${colors.blue}========================================${colors.reset}`);
  console.log(`${colors.blue}   EquipShare Email Configuration Test${colors.reset}`);
  console.log(`${colors.blue}========================================${colors.reset}\n`);

  // Check environment variables
  console.log(`${colors.blue}Checking configuration...${colors.reset}`);
  console.log(`  EMAIL_HOST: ${process.env.EMAIL_HOST || '❌ NOT SET'}`);
  console.log(`  EMAIL_PORT: ${process.env.EMAIL_PORT || '❌ NOT SET'}`);
  console.log(`  EMAIL_USER: ${process.env.EMAIL_USER || '❌ NOT SET'}`);
  console.log(`  EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? '****** (set)' : '❌ NOT SET'}`);
  console.log(`  EMAIL_FROM: ${process.env.EMAIL_FROM || '❌ NOT SET'}\n`);

  // Check for placeholder values
  if (process.env.EMAIL_USER && process.env.EMAIL_USER.includes('PASTE_YOUR')) {
    console.log(`${colors.red}❌ ERROR: You need to update .env file with your Mailtrap credentials!${colors.reset}\n`);
    console.log(`${colors.yellow}Steps to get credentials:${colors.reset}`);
    console.log(`  1. Go to https://mailtrap.io`);
    console.log(`  2. Sign up (free)`);
    console.log(`  3. Go to Inboxes → Click your inbox`);
    console.log(`  4. Click "SMTP Settings" → "Show Credentials"`);
    console.log(`  5. Copy username and password to your .env file\n`);
    process.exit(1);
  }

  // Verify email configuration
  console.log(`${colors.blue}Testing SMTP connection...${colors.reset}`);
  const configValid = await verifyEmailConfig();
  
  if (!configValid && process.env.DEMO_MODE !== 'true') {
    console.log(`${colors.red}❌ Email configuration test failed!${colors.reset}\n`);
    process.exit(1);
  }

  if (process.env.DEMO_MODE === 'true' && !process.env.EMAIL_HOST) {
    console.log(`${colors.yellow}⚠ Running in DEMO mode - emails will not actually be sent${colors.reset}`);
    console.log(`${colors.yellow}  Configure EMAIL_* variables in .env to test real email sending${colors.reset}\n`);
  } else {
    console.log(`${colors.green}✓ SMTP connection successful!${colors.reset}\n`);
  }

  // Send test email
  console.log(`${colors.blue}Sending test overdue reminder email...${colors.reset}`);
  
  const testEmail = process.argv[2] || 'test@example.com';
  const success = await sendOverdueReminder(
    testEmail,
    'Test Student',
    {
      equipmentName: 'Test Arduino Kit',
      quantity: 3,
      dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      daysOverdue: 7
    }
  );

  if (success) {
    console.log(`${colors.green}✓ Test email sent successfully!${colors.reset}\n`);
    
    if (process.env.EMAIL_HOST === 'sandbox.smtp.mailtrap.io') {
      console.log(`${colors.yellow}📧 Check your Mailtrap inbox:${colors.reset}`);
      console.log(`   https://mailtrap.io/inboxes\n`);
    }
    
    console.log(`${colors.green}========================================${colors.reset}`);
    console.log(`${colors.green}   Email configuration is working! ✓${colors.reset}`);
    console.log(`${colors.green}========================================${colors.reset}\n`);
  } else {
    console.log(`${colors.red}❌ Failed to send test email${colors.reset}\n`);
    process.exit(1);
  }
}

testEmailSetup().catch(err => {
  console.error(`${colors.red}Error:${colors.reset}`, err.message);
  process.exit(1);
});
