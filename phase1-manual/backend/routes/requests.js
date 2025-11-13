const express = require('express');
const {
  getRequests,
  getRequestById,
  createRequest,
  updateRequestStatus,
  deleteRequest
} = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

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

module.exports = router;
