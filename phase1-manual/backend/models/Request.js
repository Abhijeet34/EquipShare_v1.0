const mongoose = require('mongoose');

// Counter schema for auto-incrementing request IDs
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

const requestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Single borrow date for entire order
  borrowDate: {
    type: Date,
    required: true
  },
  // Array of equipment items in this request
  items: [{
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: true
    },
    equipmentName: {
      type: String,
      required: true
    },
    equipmentCategory: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    returnDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'returned', 'expired'],
      default: 'pending'
    },
    actualReturnDate: {
      type: Date
    }
  }],
  // Overall request status (derived from items)
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'returned', 'partial', 'expired'],
    default: 'pending'
  },
  // Auto-expiration for pending requests (24 hours)
  expiresAt: {
    type: Date,
    index: true
  },
  reason: {
    type: String,
    required: true,
    trim: true,
    minlength: [10, 'Reason must be at least 10 characters'],
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalNote: {
    type: String,
    trim: true,
    maxlength: [500, 'Approval note cannot exceed 500 characters']
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },
  expiredReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Expired reason cannot exceed 500 characters']
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'returned', 'expired'],
      required: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    comment: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to auto-generate request ID
requestSchema.pre('save', async function(next) {
  if (!this.requestId) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'requestId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.requestId = `REQ-${String(counter.seq).padStart(6, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Request', requestSchema);
