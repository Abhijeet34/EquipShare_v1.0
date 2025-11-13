const mongoose = require('mongoose');

const securityAuditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  email: {
    type: String,
    required: true
  },
  action: {
    type: String,
    enum: [
      'PASSWORD_RESET_REQUESTED',
      'OTP_GENERATED',
      'OTP_RESEND_REQUESTED',
      'OTP_RESENT',
      'OTP_VERIFIED_SUCCESS',
      'OTP_VERIFIED_FAILED',
      'PASSWORD_RESET_SUCCESS',
      'PASSWORD_RESET_FAILED',
      'ACCOUNT_LOCKED'
    ],
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: String,
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED', 'BLOCKED'],
    required: true
  },
  failureReason: String,
  metadata: {
    type: Map,
    of: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 2592000 // Auto-delete after 30 days
  }
});

// Index for faster queries
securityAuditLogSchema.index({ userId: 1, createdAt: -1 });
securityAuditLogSchema.index({ email: 1, createdAt: -1 });
securityAuditLogSchema.index({ ipAddress: 1, createdAt: -1 });

module.exports = mongoose.model('SecurityAuditLog', securityAuditLogSchema);
