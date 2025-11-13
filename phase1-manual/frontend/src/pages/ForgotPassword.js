import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { authAPI } from '../api';
import { LockIcon, UserIcon, AlertCircleIcon, SpinnerIcon, CheckCircleIcon, ArrowLeftIcon } from '../components/Icons';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetInfo, setResetInfo] = useState(null);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [captchaEnabledAt, setCaptchaEnabledAt] = useState(0);
  const recaptchaRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  // Ensure fresh captcha on mount and when navigating to this page
  useEffect(() => {
    // Clear any stale token from previous page visits
    setRecaptchaToken('');
    setIsEmailValid(false);
    
    // Reset captcha after it mounts
    const t = setTimeout(() => {
      if (recaptchaRef.current) {
        try {
          recaptchaRef.current.reset();
        } catch (e) {
          // Widget may not be loaded yet or already unmounting
          console.debug('CAPTCHA reset skipped:', e.message);
        }
      }
    }, 300);
    
    return () => {
      clearTimeout(t);
      // Don't try to reset during unmount - causes race condition
    };
  }, [location.pathname]);

  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isEmailValid) {
      setError('Please enter a valid email address');
      return;
    }

    if (!recaptchaToken) {
      setError('Please complete the reCAPTCHA verification');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.forgotPassword({ email, recaptchaToken });
      setLoading(false);
      
      // Redirect to OTP verification page
      navigate('/verify-otp', {
        state: {
          email: email,
          otp: response.data.otp, // Demo mode: will show OTP
          resetToken: response.data.resetToken, // Fallback
          expiresInSec: response.data.expiresInSec || 600
        }
      });
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to send reset link');
      // Reset reCAPTCHA on error
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
        setRecaptchaToken('');
      }
    }
  };

  return (
    <div className="auth-container auth-container-forgot-password">
      <div className="auth-card auth-card-animated">
        {!success ? (
          <>
            <div className="auth-header">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <div className="icon-wrapper icon-wrapper-warning icon-wrapper-pulse" style={{ width: '80px', height: '80px' }}>
                  <LockIcon className="icon-xl" />
                </div>
              </div>
              <h1 className="auth-title">Forgot Password?</h1>
              <p className="auth-subtitle">No worries, we'll send you reset instructions</p>
            </div>

            {error && (
              <div className="alert alert-error alert-slide-down" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircleIcon className="icon-md" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-with-icon input-with-icon-animated">
                  <UserIcon className="icon-md input-icon" />
                  <input
                    type="email"
                    className="form-control form-control-modern"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEmail(val);
                      const valid = validateEmail(val);
                      if (valid && !isEmailValid) setCaptchaEnabledAt(Date.now());
                      setIsEmailValid(valid);
                      // Reset reCAPTCHA when email changes to ensure token matches current input
                      if (recaptchaRef.current) {
                        recaptchaRef.current.reset();
                        setRecaptchaToken('');
                      }
                    }}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <div style={{ position: 'relative', width: '304px', minHeight: '86px', transition: 'box-shadow 200ms ease', boxShadow: isEmailValid && Date.now() - captchaEnabledAt < 650 ? '0 0 0 4px rgba(14,165,233,0.18)' : 'none', borderRadius: '10px', padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {!isEmailValid && (
                    <div style={{
                      position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px',
                      color: '#475569', fontSize: '0.85rem', zIndex: 3,
                      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.02)'
                    }}>
                      Enter a valid email to enable reCAPTCHA
                    </div>
                  )}
                  <div style={{
                    opacity: isEmailValid ? 1 : 0,
                    transform: isEmailValid ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.98)',
                    filter: isEmailValid ? 'blur(0)' : 'blur(2px)',
                    transition: 'opacity 220ms ease, transform 220ms ease, filter 220ms ease',
                    pointerEvents: isEmailValid ? 'auto' : 'none'
                  }}>
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                      onChange={(token) => setRecaptchaToken(token)}
                      onExpired={() => setRecaptchaToken('')}
                      onErrored={() => {
                        setRecaptchaToken('');
                        setError('reCAPTCHA timed out. Please try again.');
                      }}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit" 
                className="btn btn-primary btn-modern btn-submit-animated" 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%' }}
                disabled={loading || !isEmailValid || !recaptchaToken}
              >
                {loading ? (
                  <>
                    <SpinnerIcon className="icon-md icon-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>
            </form>

            <div className="auth-footer">
              <Link to="/login" className="auth-back-link">
                <ArrowLeftIcon className="icon-sm" style={{ display: 'inline-block', marginRight: '0.5rem' }} />
                Back to Login
              </Link>
            </div>
          </>
        ) : (
          <div className="auth-success-container">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <div className="icon-wrapper icon-wrapper-success icon-success-checkmark" style={{ width: '80px', height: '80px' }}>
                <CheckCircleIcon className="icon-xl" />
              </div>
            </div>
            <h1 className="auth-title" style={{ marginBottom: '1rem' }}>Check Your Email</h1>
            <p className="auth-subtitle" style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
              If an account exists with <strong>{email}</strong>, a password reset link has been sent.
            </p>
            
            {resetInfo && (resetInfo.resetToken || resetInfo.resetUrl) && (
              <div className="alert" style={{ 
                marginBottom: '1.5rem', 
                padding: '1rem', 
                backgroundColor: '#fffbeb', 
                border: '1px solid #fde68a', 
                borderRadius: '0.75rem',
                fontSize: '0.875rem'
              }}>
                <p style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#92400e' }}>Demo Mode - Reset Link:</p>
                <Link 
                  to={`/reset-password/${resetInfo.resetToken}`}
                  style={{ 
                    color: '#b45309', 
                    wordBreak: 'break-all',
                    textDecoration: 'underline'
                  }}
                >
                  Click here to reset password
                </Link>
              </div>
            )}

            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#f0f9ff', 
              border: '1px solid #bae6fd', 
              borderRadius: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              <p style={{ fontSize: '0.875rem', color: '#0c4a6e', margin: 0 }}>
                Didn't receive the email? Check your spam folder or try again.
              </p>
            </div>

            <Link to="/login" className="btn btn-outline btn-modern" style={{ width: '100%', textDecoration: 'none' }}>
              <ArrowLeftIcon className="icon-sm" style={{ marginRight: '0.5rem' }} />
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
