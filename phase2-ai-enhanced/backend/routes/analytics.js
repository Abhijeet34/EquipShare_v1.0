const express = require('express');
const { getSummary } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/summary', protect, authorize('admin', 'staff'), getSummary);

module.exports = router;