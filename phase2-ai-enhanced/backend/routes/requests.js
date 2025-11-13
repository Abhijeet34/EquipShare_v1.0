const express = require('express');
const {
  getRequests,
  getRequestById,
  createRequest,
  updateRequestStatus,
  deleteRequest
} = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/auth');
const Request = require('../models/Request');
const { sendOverdueReminder } = require('../utils/emailService');

const router = express.Router();

// Admin/Staff: list overdue requests
router.get('/overdue', protect, authorize('admin', 'staff'), async (req, res) => {
  try {
    const now = new Date();
    const requests = await Request.find({
      status: { $in: ['approved', 'overdue'] },
      'items.status': { $in: ['approved', 'overdue'] },
      'items.returnDate': { $lt: now }
    })
      .populate('user', 'name email role')
      .populate('items.equipment', 'name category')
      .sort({ 'items.returnDate': 1 });

    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router
  .route('/')
  .get(protect, getRequests)
  .post(protect, createRequest);

router
  .route('/:id')
  .get(protect, getRequestById)
  .delete(protect, deleteRequest);

router
  .route('/:id/status')
  .put(protect, authorize('admin', 'staff'), updateRequestStatus);

// Admin/Staff: send reminder email for overdue request
router.post('/:id/remind', protect, authorize('admin', 'staff'), async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.equipment', 'name');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (!request.user || !request.user.email) {
      return res.status(400).json({ success: false, message: 'User email not found' });
    }

    // Find overdue items
    const now = new Date();
    const overdueItems = request.items.filter(item => 
      ['approved', 'overdue'].includes(item.status) && 
      new Date(item.returnDate) < now
    );

    if (overdueItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No overdue items found' });
    }

    // Send email for each overdue item
    const emailPromises = overdueItems.map(item => {
      const daysOverdue = Math.ceil((now - new Date(item.returnDate)) / (1000 * 60 * 60 * 24));
      return sendOverdueReminder(request.user.email, request.user.name, {
        equipmentName: item.equipment?.name || item.equipmentName || 'Unknown Item',
        quantity: item.quantity,
        dueDate: item.returnDate,
        daysOverdue: daysOverdue
      });
    });

    await Promise.all(emailPromises);

    res.status(200).json({ 
      success: true, 
      message: `Reminder sent to ${request.user.email}`,
      overdueItems: overdueItems.length
    });
  } catch (err) {
    console.error('Error sending reminder:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
