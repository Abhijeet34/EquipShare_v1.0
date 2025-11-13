const express = require('express');
const { 
  sendMessage, 
  getAllMessages, 
  getMessage, 
  updateMessage 
} = require('../controllers/supportController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public route - anyone can send a message
router.post('/contact', sendMessage);

// Admin routes - protected
router.get('/messages', protect, authorize('admin'), getAllMessages);
router.get('/messages/:id', protect, authorize('admin'), getMessage);
router.put('/messages/:id', protect, authorize('admin'), updateMessage);

module.exports = router;
