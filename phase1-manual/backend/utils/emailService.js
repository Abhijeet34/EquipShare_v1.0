const nodemailer = require('nodemailer');

/**
 * Email Service for sending OTP and verification emails
 * 
 * 1. Centralized email configuration
 * 2. Template-based email content
 * 3. HTML + Plain text fallback
 * 4. Error handling and logging
 * 5. Support for multiple email providers (Gmail, SendGrid, AWS SES, etc.)
 */

// Create reusable transporter
const createTransporter = () => {
  // In demo/development mode without email config, return null
  if (process.env.DEMO_MODE === 'true' && !process.env.EMAIL_HOST) {
    console.log('[EMAIL] Service running in DEMO mode - emails will not be sent');
    return null;
  }

  // Production email configuration
  const config = {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  };

  // Optional: Support for specific services like Gmail, SendGrid
  if (process.env.EMAIL_SERVICE) {
    config.service = process.env.EMAIL_SERVICE;
  }

  return nodemailer.createTransport(config);
};

/**
 * Send OTP email for password reset
 * @param {string} email - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @param {number} expiresInMinutes - OTP expiration time in minutes
 * @returns {Promise<boolean>} - Success status
 */
exports.sendOTPEmail = async (email, otp, expiresInMinutes = 10) => {
  try {
    const transporter = createTransporter();
    
    // In demo mode without email config, skip sending
    if (!transporter) {
      console.log(`[EMAIL][DEMO] OTP for ${email}: ${otp} (expires in ${expiresInMinutes} minutes)`);
      return true;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"EquipShare Support" <noreply@equipshare.com>',
      to: email,
      subject: 'Password Reset Verification Code',
      text: `Your verification code is: ${otp}\n\nThis code will expire in ${expiresInMinutes} minutes.\n\nIf you didn't request this, please ignore this email.`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; border-radius: 5px; color: #667eea; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>You requested to reset your password. Use the verification code below to continue:</p>
              
              <div class="otp-box">${otp}</div>
              
              <p><strong>This code will expire in ${expiresInMinutes} minutes.</strong></p>
              
              <div class="warning">
                <strong>Security Notice:</strong><br>
                If you didn't request this password reset, please ignore this email. Your account remains secure.
              </div>
              
              <p>For security reasons, never share this code with anyone.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} EquipShare. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL][SUCCESS] OTP email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('[EMAIL][ERROR] Failed to send OTP email:', error);
    // In production, you might want to use a proper logging service here
    return false;
  }
};

/**
 * Send welcome/verification email for new registrations
 * @param {string} email - Recipient email address
 * @param {string} name - User's name
 * @param {string} verificationToken - Email verification token (optional)
 * @returns {Promise<boolean>} - Success status
 */
exports.sendWelcomeEmail = async (email, name, verificationToken = null) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log(`[EMAIL][DEMO] Welcome email for ${email}`);
      return true;
    }

    const verificationLink = verificationToken 
      ? `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`
      : null;

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"EquipShare Support" <noreply@equipshare.com>',
      to: email,
      subject: 'Welcome to EquipShare! 🎉',
      text: `Welcome ${name}!\n\nThank you for joining EquipShare.\n\n${verificationLink ? `Please verify your email: ${verificationLink}` : ''}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .btn { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to EquipShare!</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>Thank you for joining EquipShare. We're excited to have you on board!</p>
              
              ${verificationLink ? `
                <p>To get started, please verify your email address by clicking the button below:</p>
                <div style="text-align: center;">
                  <a href="${verificationLink}" class="btn">Verify Email Address</a>
                </div>
                <p style="font-size: 12px; color: #666;">If the button doesn't work, copy and paste this link into your browser:<br>${verificationLink}</p>
              ` : '<p>Your account is now active. You can start using EquipShare right away!</p>'}
              
              <p>If you have any questions, feel free to reach out to our support team.</p>
              
              <p>Best regards,<br>The EquipShare Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} EquipShare. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL][SUCCESS] Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('[EMAIL][ERROR] Failed to send welcome email:', error);
    return false;
  }
};

/**
 * Verify email configuration on server startup
 * @returns {Promise<boolean>}
 */
exports.verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('[EMAIL][WARNING] Email service not configured - running in DEMO mode');
      return true;
    }

    await transporter.verify();
    console.log('[EMAIL][SUCCESS] Email service configured and ready');
    return true;
  } catch (error) {
    console.error('[EMAIL][ERROR] Email service configuration error:', error.message);
    console.log('[EMAIL][WARNING] Continuing with DEMO mode - emails will not be sent');
    return false;
  }
};
