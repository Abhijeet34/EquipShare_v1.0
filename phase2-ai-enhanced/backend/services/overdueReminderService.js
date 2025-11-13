const cron = require('node-cron');
const Request = require('../models/Request');
const { sendOverdueReminder } = require('../utils/emailService');

/**
 * Automated Overdue Reminder Service
 * 
 * Industry Best Practices:
 * - Day 0 (Due Date): Gentle reminder
 * - Day 1: First overdue notification
 * - Day 3: Escalation reminder
 * - Day 7: Final notice
 * 
 * Runs every day at 9:00 AM
 */

// Track sent reminders to avoid duplicates
const sentReminders = new Map();

/**
 * Check and send overdue reminders
 */
async function checkAndSendReminders() {
  try {
    console.log('[OVERDUE-SERVICE] Running automated reminder check...');
    
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today

    // Find all approved requests with items past due date
    const requests = await Request.find({
      status: { $in: ['approved', 'overdue'] },
      'items.status': { $in: ['approved', 'overdue'] }
    })
      .populate('user', 'name email')
      .populate('items.equipment', 'name');

    let remindersSent = 0;
    let remindersSkipped = 0;

    for (const request of requests) {
      if (!request.user || !request.user.email) continue;

      const overdueItems = request.items.filter(item => {
        const returnDate = new Date(item.returnDate);
        returnDate.setHours(0, 0, 0, 0);
        return ['approved', 'overdue'].includes(item.status) && returnDate < now;
      });

      if (overdueItems.length === 0) continue;

      // Process each overdue item
      for (const item of overdueItems) {
        const returnDate = new Date(item.returnDate);
        returnDate.setHours(0, 0, 0, 0);
        const daysOverdue = Math.floor((now - returnDate) / (1000 * 60 * 60 * 24));

        // Determine if we should send a reminder based on days overdue
        const shouldSend = shouldSendReminder(daysOverdue);
        
        if (!shouldSend) {
          remindersSkipped++;
          continue;
        }

        // Check if we already sent a reminder today for this item
        const reminderKey = `${request._id}-${item._id}-${now.toISOString().split('T')[0]}`;
        if (sentReminders.has(reminderKey)) {
          remindersSkipped++;
          continue;
        }

        try {
          await sendOverdueReminder(request.user.email, request.user.name, {
            equipmentName: item.equipment?.name || item.equipmentName || 'Unknown Item',
            quantity: item.quantity,
            dueDate: item.returnDate,
            daysOverdue: daysOverdue
          });

          // Mark as sent
          sentReminders.set(reminderKey, true);
          remindersSent++;

          console.log(`[OVERDUE-SERVICE] Reminder sent to ${request.user.email} for ${item.equipment?.name || item.equipmentName} (${daysOverdue} days overdue)`);
          
          // Rate limiting: delay between emails to avoid SMTP limits
          // Adjust based on your email provider (Mailtrap free: ~2/sec, most providers: 10-20/sec)
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`[OVERDUE-SERVICE] Failed to send reminder to ${request.user.email}:`, error.message);
        }
      }
    }

    console.log(`[OVERDUE-SERVICE] Check complete. Sent: ${remindersSent}, Skipped: ${remindersSkipped}`);

    // Clean up old entries in sentReminders map (keep only last 30 days)
    cleanupReminderCache();

  } catch (error) {
    console.error('[OVERDUE-SERVICE] Error during reminder check:', error);
  }
}

/**
 * Determine if a reminder should be sent based on days overdue
 * Industry best practice: Send on days 0, 1, 3, 7, then every 7 days
 * 
 * @param {number} daysOverdue - Number of days the item is overdue
 * @returns {boolean} - Whether to send a reminder
 */
function shouldSendReminder(daysOverdue) {
  // Day 0 (due date) - Gentle reminder
  if (daysOverdue === 0) return true;
  
  // Day 1 - First overdue notification
  if (daysOverdue === 1) return true;
  
  // Day 3 - Escalation reminder
  if (daysOverdue === 3) return true;
  
  // Day 7 - Final notice
  if (daysOverdue === 7) return true;
  
  // After day 7, send reminder every 7 days (14, 21, 28, etc.)
  if (daysOverdue > 7 && daysOverdue % 7 === 0) return true;
  
  return false;
}

/**
 * Clean up old entries from reminder cache
 * Removes entries older than 30 days
 */
function cleanupReminderCache() {
  const today = new Date().toISOString().split('T')[0];
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30);
  const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

  for (const [key] of sentReminders) {
    const keyDate = key.split('-').slice(-3).join('-'); // Extract date from key
    if (keyDate < cutoffDateStr) {
      sentReminders.delete(key);
    }
  }
}

/**
 * Start the automated reminder service
 * Runs daily at 9:00 AM in the configured timezone
 * 
 * IMPORTANT TIMEZONE INFO:
 * - By default, node-cron uses the SERVER'S LOCAL TIMEZONE
 * - You can specify timezone via options: { timezone: "America/New_York" }
 * - Set REMINDER_TIMEZONE in .env to configure explicitly
 * - If not set, uses server time (check with: date command on server)
 */
function startReminderService() {
  // Schedule: Run every day at 9:00 AM
  // Cron format: minute hour day month weekday
  // '0 9 * * *' = At 9:00 AM every day
  
  const cronSchedule = process.env.REMINDER_CRON_SCHEDULE || '0 9 * * *';
  const timezone = process.env.REMINDER_TIMEZONE || Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  console.log(`[OVERDUE-SERVICE] Starting automated reminder service`);
  console.log(`[OVERDUE-SERVICE] Schedule: ${cronSchedule}`);
  console.log(`[OVERDUE-SERVICE] Timezone: ${timezone} (Server local time)`);
  console.log(`[OVERDUE-SERVICE] Current server time: ${new Date().toLocaleString('en-US', { timeZone: timezone })}`);
  
  cron.schedule(cronSchedule, () => {
    const now = new Date();
    console.log(`[OVERDUE-SERVICE] Cron triggered at: ${now.toLocaleString('en-US', { timeZone: timezone })}`);
    checkAndSendReminders();
  }, {
    timezone: timezone
  });

  // Run immediately on startup for testing (can be disabled in production)
  if (process.env.RUN_REMINDERS_ON_STARTUP === 'true') {
    console.log('[OVERDUE-SERVICE] Running initial check on startup...');
    setTimeout(() => checkAndSendReminders(), 5000); // Wait 5 seconds after server start
  }
}

/**
 * Manual trigger for testing
 */
async function triggerManualCheck() {
  console.log('[OVERDUE-SERVICE] Manual check triggered');
  await checkAndSendReminders();
}

module.exports = {
  startReminderService,
  checkAndSendReminders,
  triggerManualCheck,
  shouldSendReminder
};
