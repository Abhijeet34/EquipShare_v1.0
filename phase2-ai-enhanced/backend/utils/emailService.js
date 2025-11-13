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
 * Get reminder template based on days overdue (escalation levels)
 * @param {number} daysOverdue - Number of days overdue
 * @returns {Object} - Template configuration { tone, urgency, color, icon }
 */
function getReminderLevel(daysOverdue) {
  if (daysOverdue === 0) {
    return {
      level: 'friendly',
      tone: 'Friendly Reminder',
      headerGradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
      badgeGradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      icon: '🔔',
      subject: 'Friendly Reminder',
      greeting: 'Hi',
      intro: 'Just a friendly heads-up that your borrowed equipment is due for return today. No worries if you need a bit more time!',
      actionText: 'We kindly ask you to return the equipment at your earliest convenience, or reach out if you need an extension.'
    };
  } else if (daysOverdue === 1) {
    return {
      level: 'polite',
      tone: 'Gentle Reminder',
      headerGradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
      badgeGradient: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
      icon: '⏰',
      subject: 'Equipment Return Reminder',
      greeting: 'Hello',
      intro: 'Your borrowed equipment is now 1 day overdue. We understand things come up!',
      actionText: 'Please return the equipment soon to help us serve other students. If you need help or an extension, just let us know.'
    };
  } else if (daysOverdue === 3) {
    return {
      level: 'urgent',
      tone: 'Urgent: Return Required',
      headerGradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
      badgeGradient: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
      icon: '⚠️',
      subject: 'Urgent Return Required',
      greeting: 'Dear',
      intro: 'Your borrowed equipment is now 3 days overdue. We need it back urgently as other students are waiting.',
      actionText: 'Please return the equipment immediately. Continued delays may result in late fees or restrictions on future borrowing.'
    };
  } else {
    return {
      level: 'final',
      tone: 'Final Notice',
      headerGradient: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
      badgeGradient: 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)',
      icon: '🚨',
      subject: 'FINAL NOTICE',
      greeting: 'Dear',
      intro: `Your borrowed equipment is now ${daysOverdue} days overdue. This is your final notice.`,
      actionText: 'You must return the equipment immediately or contact us to resolve this matter. Failure to respond may result in additional fees, account suspension, and potential disciplinary action.'
    };
  }
}

/**
 * Send overdue equipment reminder with escalation-appropriate template
 * @param {string} email - Recipient email address
 * @param {string} name - User's name
 * @param {Object} overdueDetails - Equipment details
 * @returns {Promise<boolean>} - Success status
 */
exports.sendOverdueReminder = async (email, name, overdueDetails, retryCount = 0) => {
  const MAX_RETRIES = 2;
  const RETRY_DELAY = 3000; // 3 seconds
  
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log(`[EMAIL][DEMO] Overdue reminder for ${email}:`, overdueDetails);
      return true;
    }

    const { equipmentName, quantity, dueDate, daysOverdue } = overdueDetails;
    const formattedDueDate = new Date(dueDate).toLocaleDateString();

    const dashboardUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const supportEmail = process.env.SUPPORT_EMAIL || 'support@equipshare.com';
    
    // Get appropriate template based on days overdue
    const template = getReminderLevel(daysOverdue);

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"EquipShare" <noreply@equipshare.com>',
      to: email,
      subject: `${template.icon} ${template.subject}: ${equipmentName} (${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue)`,
      text: `${template.greeting} ${name},\n\n${template.intro}\n\nEquipment: ${equipmentName}\nQuantity: ${quantity}\nDue Date: ${formattedDueDate}\nDays Overdue: ${daysOverdue}\n\n${template.actionText}\n\nView your requests: ${dashboardUrl}/requests\nContact us: ${supportEmail}\n\nBest regards,\nThe EquipShare Team`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <title>Equipment Return Reminder</title>
          <!--[if mso]>
          <style type="text/css">
            body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
          </style>
          <![endif]-->
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6; 
              color: #1f2937;
              background-color: #f3f4f6;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            .email-wrapper { 
              width: 100%; 
              background-color: #f3f4f6; 
              padding: 40px 20px;
            }
            .email-container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
            }
            .header { 
              background: ${template.headerGradient};
              padding: 40px 30px;
              text-align: center;
            }
            .header-icon {
              font-size: 48px;
              margin-bottom: 10px;
            }
            .header h1 { 
              color: #ffffff;
              font-size: 28px;
              font-weight: 700;
              margin: 0;
              text-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .content { 
              padding: 40px 30px;
            }
            .greeting {
              font-size: 18px;
              font-weight: 600;
              color: #111827;
              margin-bottom: 20px;
            }
            .overdue-badge { 
              background: ${template.badgeGradient};
              color: white;
              padding: 12px 24px;
              border-radius: 8px;
              display: inline-block;
              font-weight: 700;
              font-size: 16px;
              margin: 20px 0;
              box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);
            }
            .intro-text {
              font-size: 16px;
              color: #4b5563;
              margin-bottom: 24px;
            }
            .details-card { 
              background: #f9fafb;
              border: 2px solid #e5e7eb;
              border-left: 6px solid #f59e0b;
              padding: 24px;
              margin: 24px 0;
              border-radius: 12px;
            }
            .detail-row { 
              display: flex;
              padding: 12px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .detail-row:last-child {
              border-bottom: none;
            }
            .detail-label { 
              font-weight: 600;
              color: #6b7280;
              min-width: 140px;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .detail-value {
              color: #111827;
              font-weight: 600;
              font-size: 16px;
            }
            .warning-box { 
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
              border: 2px solid #fbbf24;
              padding: 20px;
              margin: 24px 0;
              border-radius: 12px;
            }
            .warning-title {
              font-weight: 700;
              color: #92400e;
              font-size: 16px;
              margin-bottom: 8px;
              display: flex;
              align-items: center;
            }
            .warning-text {
              color: #78350f;
              font-size: 14px;
              line-height: 1.6;
            }
            .cta-section {
              text-align: center;
              margin: 32px 0;
            }
            .btn-primary { 
              display: inline-block;
              background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
              color: #ffffff !important;
              text-decoration: none;
              padding: 16px 36px;
              border-radius: 10px;
              font-weight: 700;
              font-size: 16px;
              box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
              transition: all 0.3s ease;
            }
            .btn-secondary {
              display: inline-block;
              background: #ffffff;
              color: #6366f1 !important;
              text-decoration: none;
              padding: 14px 32px;
              border: 2px solid #6366f1;
              border-radius: 10px;
              font-weight: 600;
              font-size: 14px;
              margin-left: 12px;
            }
            .help-section {
              background: #f3f4f6;
              border-radius: 12px;
              padding: 24px;
              margin: 32px 0;
              text-align: center;
            }
            .help-title {
              font-size: 16px;
              font-weight: 600;
              color: #374151;
              margin-bottom: 12px;
            }
            .help-text {
              font-size: 14px;
              color: #6b7280;
              margin-bottom: 16px;
            }
            .contact-link {
              color: #6366f1;
              text-decoration: none;
              font-weight: 600;
            }
            .footer { 
              background: #1f2937;
              padding: 32px 30px;
              text-align: center;
            }
            .footer-brand {
              font-size: 20px;
              font-weight: 700;
              color: #ffffff;
              margin-bottom: 16px;
            }
            .footer-text {
              color: #9ca3af;
              font-size: 13px;
              line-height: 1.6;
              margin: 8px 0;
            }
            .footer-links {
              margin: 20px 0;
            }
            .footer-link {
              color: #d1d5db;
              text-decoration: none;
              margin: 0 12px;
              font-size: 13px;
            }
            .social-links {
              margin-top: 20px;
            }
            .social-link {
              display: inline-block;
              margin: 0 8px;
              color: #9ca3af;
              text-decoration: none;
            }
            @media only screen and (max-width: 600px) {
              .email-wrapper { padding: 20px 10px; }
              .content { padding: 30px 20px; }
              .header { padding: 30px 20px; }
              .header h1 { font-size: 24px; }
              .btn-secondary { margin-left: 0; margin-top: 12px; display: block; }
              .detail-row { flex-direction: column; }
              .detail-label { margin-bottom: 4px; }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="email-container">
              <!-- Header -->
              <div class="header">
                <div class="header-icon">${template.icon}</div>
                <h1>${template.tone}</h1>
              </div>
              
              <!-- Content -->
              <div class="content">
                <div class="greeting">${template.greeting} ${name},</div>
                
                <div class="overdue-badge">
                  📅 ${daysOverdue} Day${daysOverdue !== 1 ? 's' : ''} Overdue
                </div>
                
                <p class="intro-text">
                  ${template.intro}
                </p>
                
                <!-- Equipment Details -->
                <div class="details-card">
                  <div class="detail-row">
                    <div class="detail-label">Equipment</div>
                    <div class="detail-value">${equipmentName}</div>
                  </div>
                  <div class="detail-row">
                    <div class="detail-label">Quantity</div>
                    <div class="detail-value">${quantity}</div>
                  </div>
                  <div class="detail-row">
                    <div class="detail-label">Due Date</div>
                    <div class="detail-value">${formattedDueDate}</div>
                  </div>
                  <div class="detail-row">
                    <div class="detail-label">Days Overdue</div>
                    <div class="detail-value" style="color: #dc2626;">${daysOverdue}</div>
                  </div>
                </div>
                
                <!-- Warning Box -->
                <div class="warning-box">
                  <div class="warning-title">⚡ Action Required</div>
                  <div class="warning-text">
                    ${template.actionText}
                  </div>
                </div>
                
                <!-- CTA Buttons -->
                <div class="cta-section">
                  <a href="${dashboardUrl}/requests" class="btn-primary" style="color: #ffffff; text-decoration: none;">
                    📦 View My Requests
                  </a>
                  <a href="${dashboardUrl}/contact" class="btn-secondary" style="color: #6366f1; text-decoration: none;">
                    💬 Contact Support
                  </a>
                </div>
                
                <!-- Help Section -->
                <div class="help-section">
                  <div class="help-title">Need Help?</div>
                  <div class="help-text">
                    If you have any questions or need to arrange an extension, 
                    our support team is here to help.
                  </div>
                  <a href="mailto:${supportEmail}" class="contact-link">${supportEmail}</a>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">
                  Thank you for your cooperation and for being a valued member of the EquipShare community.
                </p>
                
                <p style="color: #374151; font-size: 15px; font-weight: 600; margin-top: 24px;">
                  Best regards,<br>
                  <span style="color: #6366f1;">The EquipShare Team</span>
                </p>
              </div>
              
              <!-- Footer -->
              <div class="footer">
                <div class="footer-brand">EquipShare</div>
                <div class="footer-text">
                  Making equipment sharing simple, efficient, and accessible.
                </div>
                <div class="footer-links">
                  <a href="${dashboardUrl}/equipment" class="footer-link">Equipment</a>
                  <a href="${dashboardUrl}/requests" class="footer-link">My Requests</a>
                  <a href="${dashboardUrl}/contact" class="footer-link">Contact</a>
                  <a href="${dashboardUrl}/help" class="footer-link">Help</a>
                </div>
                <div class="footer-text" style="margin-top: 20px;">
                  © ${new Date().getFullYear()} EquipShare. All rights reserved.
                </div>
                <div class="footer-text" style="font-size: 11px; margin-top: 12px;">
                  This is an automated reminder. Please do not reply to this email.
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL][SUCCESS] Overdue reminder sent to ${email} for ${equipmentName}`);
    return true;
  } catch (error) {
    // Check if it's a rate limit error
    const isRateLimitError = error.message && error.message.includes('Too many emails');
    
    if (isRateLimitError && retryCount < MAX_RETRIES) {
      console.log(`[EMAIL][RETRY] Rate limit hit, retrying in ${RETRY_DELAY/1000}s (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return exports.sendOverdueReminder(email, name, overdueDetails, retryCount + 1);
    }
    
    console.error('[EMAIL][ERROR] Failed to send overdue reminder:', error.message);
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
