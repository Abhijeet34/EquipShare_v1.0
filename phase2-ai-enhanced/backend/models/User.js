const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters'],
    maxlength: [64, 'Password cannot exceed 64 characters'],
    select: false,
    validate: {
      validator: function(v) {
        // Require upper, lower, digit, special; no spaces; 8-64 handled above
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}[\]\\|:;"'<>?,./`~])[^\s]{8,64}$/.test(v);
      },
      message: 'Password must include upper, lower, number, special character and contain no spaces.'
    }
  },
  role: {
    type: String,
    enum: ['student', 'staff', 'admin'],
    default: 'student'
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  passwordResetOTP: String,
  passwordResetOTPExpire: Date,
  resetAttempts: {
    type: Number,
    default: 0
  },
  accountLockedUntil: Date,
  passwordHistory: {
    type: [{
      hash: String,
      changedAt: { type: Date, default: Date.now }
    }],
    default: [],
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  // Store current password in history before hashing new one
  if (this.password && !this.isNew) {
    // Get the old password hash from DB before it's replaced
    const oldUser = await this.constructor.findById(this._id).select('+password +passwordHistory');
    if (oldUser && oldUser.password) {
      // Add old password to history
      if (!this.passwordHistory) this.passwordHistory = [];
      this.passwordHistory.unshift({
        hash: oldUser.password,
        changedAt: new Date()
      });
      // Keep only last 5 passwords
      this.passwordHistory = this.passwordHistory.slice(0, 5);
    }
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.isPasswordInHistory = async function(newPassword) {
  if (!this.passwordHistory || this.passwordHistory.length === 0) {
    return false;
  }
  
  // Check if new password matches any of the last 5 passwords
  for (const entry of this.passwordHistory) {
    const matches = await bcrypt.compare(newPassword, entry.hash);
    if (matches) {
      return true;
    }
  }
  return false;
};

userSchema.methods.getResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

userSchema.methods.generateOTP = function() {
  // Generate 6-digit OTP and ensure it differs from the current one
  let otp, hashed;
  const previousOTP = this.passwordResetOTP;
  let attempts = 0;
  const maxAttempts = 10; // Prevent infinite loop
  
  do {
    // Use crypto.randomInt for better randomness
    otp = crypto.randomInt(100000, 1000000).toString();
    hashed = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');
    attempts++;
  } while (hashed === previousOTP && attempts < maxAttempts);

  this.passwordResetOTP = hashed;
  this.passwordResetOTPExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  return otp;
};

userSchema.methods.verifyOTP = function(enteredOTP) {
  const hashedOTP = crypto
    .createHash('sha256')
    .update(enteredOTP)
    .digest('hex');
  
  return this.passwordResetOTP === hashedOTP && 
         this.passwordResetOTPExpire > Date.now();
};

userSchema.methods.isAccountLocked = function() {
  return this.accountLockedUntil && this.accountLockedUntil > Date.now();
};

userSchema.methods.incrementResetAttempts = function() {
  this.resetAttempts += 1;
  
  // Lock account for 10 minutes after 5 failed attempts
  if (this.resetAttempts >= 5) {
    this.accountLockedUntil = Date.now() + 10 * 60 * 1000;
  }
};

userSchema.methods.resetSecurityCounters = function() {
  this.resetAttempts = 0;
  this.accountLockedUntil = undefined;
  this.passwordResetOTP = undefined;
  this.passwordResetOTPExpire = undefined;
};

module.exports = mongoose.model('User', userSchema);
