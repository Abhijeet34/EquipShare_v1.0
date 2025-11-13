const express = require('express');
const {
  subscribe,
  unsubscribe,
  checkSubscription,
  getUserSubscriptions,
  bulkCheckSubscriptions
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get user's all subscriptions
router.get('/my-subscriptions', getUserSubscriptions);

// Bulk check subscriptions (for equipment list page)
router.post('/bulk-check', bulkCheckSubscriptions);

// Subscribe/unsubscribe/check for specific equipment
router.post('/:equipmentId/subscribe', subscribe);
router.delete('/:equipmentId/unsubscribe', unsubscribe);
router.get('/:equipmentId/status', checkSubscription);

module.exports = router;
