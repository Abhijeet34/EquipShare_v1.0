const express = require('express');
const { register, login, getMe, forgotPassword, verifyOTP, resetPassword, resendOTP } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { forgotPasswordLimiter, otpVerificationLimiter, passwordResetLimiter, resendOTPLimiter } = require('../middleware/rateLimiter');
const { verifyRecaptcha } = require('../middleware/recaptcha');

const router = express.Router();

router.post('/register', verifyRecaptcha, register);
router.post('/login', verifyRecaptcha, login);
router.get('/me', protect, getMe);
router.post('/forgot-password', verifyRecaptcha, forgotPasswordLimiter, forgotPassword);
router.post('/resend-otp', resendOTPLimiter, resendOTP);
router.post('/verify-otp', otpVerificationLimiter, verifyOTP);
router.put('/reset-password/:token', passwordResetLimiter, resetPassword);

module.exports = router;
