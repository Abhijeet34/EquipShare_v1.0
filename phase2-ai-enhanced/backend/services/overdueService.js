const Request = require('../models/Request');
const Equipment = require('../models/Equipment');

/**
 * Mark approved items past returnDate as overdue.
 * Updates item.status to 'overdue' and request.status to 'overdue'.
 */
async function markOverdueItems() {
  const now = new Date();
  const requests = await Request.find({
    status: { $in: ['approved'] },
    'items.status': { $in: ['approved'] },
    'items.returnDate': { $lt: now }
  });

  let updated = 0;
  for (const req of requests) {
    let anyOverdue = false;

    if (Array.isArray(req.items)) {
      for (const item of req.items) {
        if (item.status === 'approved' && new Date(item.returnDate) < now) {
          item.status = 'overdue';
          anyOverdue = true;
        }
      }
    }

    if (anyOverdue) {
      req.status = 'overdue';
      req.statusHistory.push({
        status: req.status,
        changedBy: req.user,
        changedAt: new Date(),
        comment: 'Auto-flagged overdue items past return date'
      });
      await req.save();
      updated++;
    }
  }
  return updated;
}

function startOverdueMonitor() {
  const INTERVAL_MS = 60 * 1000; // 1 minute
  console.log('Starting overdue monitor (runs every minute)');
  // run immediately
  markOverdueItems().catch(err => console.error('Initial overdue check failed:', err));
  setInterval(() => {
    markOverdueItems().catch(err => console.error('Scheduled overdue check failed:', err));
  }, INTERVAL_MS);
}

module.exports = { startOverdueMonitor, markOverdueItems };