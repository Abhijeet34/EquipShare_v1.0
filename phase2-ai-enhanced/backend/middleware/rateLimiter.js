const rateLimit = require('express-rate-limit');

// Rate limiter for password reset requests (by IP)
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many password reset attempts from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests
  skipSuccessfulRequests: false,
  // Skip failed requests
  skipFailedRequests: false
});

// Rate limiter for OTP verification (stricter)
const otpVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Allow 10 OTP attempts per 15 minutes
  message: {
    success: false,
    message: 'Too many OTP verification attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter for forgot password endpoint
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 requests per hour
  message: {
    success: false,
    message: 'Too many password reset requests. Please try again after 1 hour.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter for resend OTP endpoint (scoped per IP + email to avoid cross-email carryover)
const resendOTPLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Allow up to 5 resends per 10 minutes per IP+email
  message: {
    success: false,
    message: 'Too many resend attempts. Please try again after 10 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Get IP address, handling both IPv4 and IPv6
    const ip = req.ip || req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'unknown';
    const email = (req.body?.email || 'unknown').toString().trim().toLowerCase();
    return `${ip}:${email}`;
  }
});

module.exports = {
  passwordResetLimiter,
  otpVerificationLimiter,
  forgotPasswordLimiter,
  resendOTPLimiter
};
