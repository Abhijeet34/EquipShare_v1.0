const axios = require('axios');

// In-memory store for used tokens (for production, use Redis or database)
const usedTokens = new Set();
const TOKEN_EXPIRY = 5 * 60 * 1000; // 5 minutes

// Clean up old tokens periodically
setInterval(() => {
  usedTokens.clear();
}, TOKEN_EXPIRY);

const verifyRecaptcha = async (req, res, next) => {
  try {
    const { recaptchaToken } = req.body;

    if (!recaptchaToken) {
      return res.status(400).json({
        success: false,
        message: 'Please complete the reCAPTCHA verification'
      });
    }

    // Check if token has already been used (prevent replay attacks)
    if (usedTokens.has(recaptchaToken)) {
      return res.status(400).json({
        success: false,
        message: 'reCAPTCHA token has already been used. Please refresh and try again.'
      });
    }

    // Verify token with Google
    const verificationURL = 'https://www.google.com/recaptcha/api/siteverify';
    const response = await axios.post(verificationURL, null, {
      params: {
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: recaptchaToken,
        remoteip: req.ip || req.connection.remoteAddress
      }
    });

    const { success, hostname, challenge_ts, 'error-codes': errorCodes } = response.data;

    // Check if verification failed
    if (!success) {
      console.warn('reCAPTCHA verification failed:', errorCodes);
      return res.status(400).json({
        success: false,
        message: 'reCAPTCHA verification failed. Please try again.'
      });
    }

    // Optional: Verify hostname matches (only in production)
    // if (process.env.NODE_ENV === 'production' && hostname !== process.env.ALLOWED_HOSTNAME) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Invalid reCAPTCHA hostname'
    //   });
    // }

    // Optional: Check if token is too old (Google's tokens expire after 2 minutes by default)
    const tokenAge = Date.now() - new Date(challenge_ts).getTime();
    if (tokenAge > 2 * 60 * 1000) { // 2 minutes
      return res.status(400).json({
        success: false,
        message: 'reCAPTCHA token has expired. Please try again.'
      });
    }

    // Mark token as used to prevent replay attacks
    usedTokens.add(recaptchaToken);

    // Verification successful, proceed to next middleware
    next();
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying reCAPTCHA. Please try again.'
    });
  }
};

module.exports = { verifyRecaptcha };
