const User = require('../models/User');
const SecurityAuditLog = require('../models/SecurityAuditLog');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendOTPEmail } = require('../utils/emailService');

// Helper function to get client IP
const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         'unknown';
};

// Format remaining milliseconds to mm:ss
const formatRemaining = (ms) => {
  const clamped = Math.max(0, ms);
  const m = Math.floor(clamped / 60000);
  const s = Math.floor((clamped % 60000) / 1000);
  return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Security: Always create new users with 'student' role
    // Admins can upgrade roles later through admin panel
    const user = await User.create({
      name,
      email,
      password,
      role: 'student'
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const ipAddress = getClientIP(req);

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email' });
    }

    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration attacks
    // Even if user doesn't exist, we tell them we sent an email
    if (!user) {
      // Log attempt for non-existent user
      await SecurityAuditLog.create({
        email,
        action: 'PASSWORD_RESET_REQUESTED',
        ipAddress,
        userAgent: req.headers['user-agent'],
        status: 'FAILED',
        failureReason: 'User not found'
      });
      
      return res.status(200).json({
        success: true,
        message: 'If an account exists with that email, a verification code has been sent'
      });
    }

    // Check if account is locked
    if (user.isAccountLocked()) {
      await SecurityAuditLog.create({
        userId: user._id,
        email,
        action: 'PASSWORD_RESET_REQUESTED',
        ipAddress,
        userAgent: req.headers['user-agent'],
        status: 'BLOCKED',
        failureReason: 'Account locked'
      });
      const remaining = user.accountLockedUntil - Date.now();
      return res.status(403).json({
        success: false,
        message: `Account is temporarily locked. Try again in ${formatRemaining(remaining)}.`
      });
    }

    // Generate OTP
    const otp = user.generateOTP();
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Log successful OTP generation
    await SecurityAuditLog.create({
      userId: user._id,
      email,
      action: 'OTP_GENERATED',
      ipAddress,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS'
    });

    // Send OTP via email (or log in demo mode)
    await sendOTPEmail(email, otp, 10);
    const response = {
      success: true,
      message: 'If an account exists with that email, a verification code has been sent',
      email, // Return email for next step
      expiresInSec: Math.max(0, Math.floor((user.passwordResetOTPExpire - Date.now()) / 1000))
    };

    // Only include OTP in response if in demo mode
    if (process.env.DEMO_MODE === 'true') {
      response.otp = otp;
    }

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const ipAddress = getClientIP(req);

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email' });
    }

    const user = await User.findOne({ email });

    // For security, don't reveal if user doesn't exist
    if (!user) {
      await SecurityAuditLog.create({
        email,
        action: 'OTP_RESEND_REQUESTED',
        ipAddress,
        userAgent: req.headers['user-agent'],
        status: 'FAILED',
        failureReason: 'User not found'
      });

      return res.status(200).json({ success: true, message: 'If an account exists with that email, a verification code has been sent' });
    }

    // Check if account is locked
    if (user.isAccountLocked()) {
      await SecurityAuditLog.create({
        userId: user._id,
        email,
        action: 'OTP_RESEND_REQUESTED',
        ipAddress,
        userAgent: req.headers['user-agent'],
        status: 'BLOCKED',
        failureReason: 'Account locked'
      });
      const remaining = user.accountLockedUntil - Date.now();
      return res.status(403).json({ success: false, message: `Account is temporarily locked. Try again in ${formatRemaining(remaining)}.` });
    }

    const otp = user.generateOTP();
    await user.save({ validateBeforeSave: false });

    await SecurityAuditLog.create({
      userId: user._id,
      email,
      action: 'OTP_RESENT',
      ipAddress,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS'
    });

    // Send OTP via email (or log in demo mode)
    await sendOTPEmail(email, otp, 10);

    const response = {
      success: true,
      message: 'Verification code resent',
      email,
      expiresInSec: Math.max(0, Math.floor((user.passwordResetOTPExpire - Date.now()) / 1000))
    };

    // Only include OTP in response if in demo mode
    if (process.env.DEMO_MODE === 'true') {
      response.otp = otp;
    }

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const ipAddress = getClientIP(req);

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and OTP' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    // Check if account is locked
    if (user.isAccountLocked()) {
      await SecurityAuditLog.create({
        userId: user._id,
        email,
        action: 'OTP_VERIFIED_FAILED',
        ipAddress,
        userAgent: req.headers['user-agent'],
        status: 'BLOCKED',
        failureReason: 'Account locked'
      });
      const remaining = user.accountLockedUntil - Date.now();
      return res.status(403).json({
        success: false,
        message: `Account is temporarily locked. Try again in ${formatRemaining(remaining)}.`
      });
    }

    // Verify OTP
    const isValidOTP = user.verifyOTP(otp);

    if (!isValidOTP) {
      // Increment failed attempts
      user.incrementResetAttempts();
      await user.save({ validateBeforeSave: false });

      await SecurityAuditLog.create({
        userId: user._id,
        email,
        action: 'OTP_VERIFIED_FAILED',
        ipAddress,
        userAgent: req.headers['user-agent'],
        status: 'FAILED',
        failureReason: 'Invalid OTP',
        metadata: new Map([['attempts', user.resetAttempts.toString()]])
      });

      if (user.isAccountLocked()) {
        await SecurityAuditLog.create({
          userId: user._id,
          email,
          action: 'ACCOUNT_LOCKED',
          ipAddress,
          userAgent: req.headers['user-agent'],
          status: 'BLOCKED',
          failureReason: 'Too many failed OTP attempts'
        });
        
        return res.status(403).json({
          success: false,
          message: 'Too many failed attempts. Account locked for 10 minutes.'
        });
      }

      return res.status(400).json({
        success: false,
        message: `Invalid verification code. ${5 - user.resetAttempts} attempts remaining.`
      });
    }

    // OTP verified successfully
    await SecurityAuditLog.create({
      userId: user._id,
      email,
      action: 'OTP_VERIFIED_SUCCESS',
      ipAddress,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS'
    });

    // Generate a new short-lived token for password reset
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Verification successful',
      resetToken,
      email
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const ipAddress = getClientIP(req);

    if (!password) {
      return res.status(400).json({ success: false, message: 'Please provide a new password' });
    }

    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    }).select('+password +passwordHistory');

    if (!user) {
      await SecurityAuditLog.create({
        email: 'unknown',
        action: 'PASSWORD_RESET_FAILED',
        ipAddress,
        userAgent: req.headers['user-agent'],
        status: 'FAILED',
        failureReason: 'Invalid or expired token'
      });
      
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    // Check if account is locked (extra safety)
    if (user.isAccountLocked()) {
      return res.status(403).json({
        success: false,
        message: 'Account is temporarily locked. Please try again later.'
      });
    }

    // Check if password was used in the last 5 passwords
    const isInHistory = await user.isPasswordInHistory(password);
    if (isInHistory) {
      await SecurityAuditLog.create({
        userId: user._id,
        email: user.email,
        action: 'PASSWORD_RESET_FAILED',
        ipAddress,
        userAgent: req.headers['user-agent'],
        status: 'FAILED',
        failureReason: 'Password recently used'
      });
      
      return res.status(400).json({ 
        success: false, 
        message: 'This password was recently used. Please choose a different password.' 
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.resetSecurityCounters(); // Reset all security counters
    await user.save();

    // Log successful password reset
    await SecurityAuditLog.create({
      userId: user._id,
      email: user.email,
      action: 'PASSWORD_RESET_SUCCESS',
      ipAddress,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS'
    });

    const jwtToken = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
