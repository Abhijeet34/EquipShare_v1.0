import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authAPI } from '../api';
import { KeyIcon, AlertCircleIcon, SpinnerIcon, CheckCircleIcon, ArrowLeftIcon, ShieldCheckIcon } from '../components/Icons';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [expiresIn, setExpiresIn] = useState(0);
  const [expired, setExpired] = useState(false);
  const [currentOTP, setCurrentOTP] = useState('');
  const [otpUpdated, setOtpUpdated] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const initialOTP = location.state?.otp || '';
  const initialExpiresIn = location.state?.expiresInSec ?? 600;

  useEffect(() => {
    // Auto-focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
    // Initialize OTP and timers from navigation state
    setCurrentOTP(initialOTP);
    setExpiresIn(initialExpiresIn);
    setExpired(false);
    setResendCooldown(30); // 30s resend cooldown
  }, []);

  // Expiry timer
  useEffect(() => {
    if (!expiresIn || success) return;
    if (expiresIn <= 0) {
      setExpired(true);
      return;
    }
    const t = setInterval(() => setExpiresIn((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [expiresIn, success]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const handleChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(''); // Clear error on input

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('');
    setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')]);
    
    // Focus last filled input
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (expired) {
      setError('This code has expired. Please resend a new code.');
      return;
    }

    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.verifyOTP({ email, otp: otpCode });
      setSuccess(true);
      setResetToken(response.data.resetToken);
      setLoading(false);

      // Redirect to reset password page
      setTimeout(() => {
        navigate(`/reset-password/${response.data.resetToken}`, {
          state: { email: response.data.email, fromOTP: true }
        });
      }, 1500);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Invalid verification code');
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (resending || resendCooldown > 0) return;
    // Start UI cooldown immediately to prevent rapid clicks; server headers may override below
    setResendCooldown(30);
    setResending(true);
    setError('');
    setNotice('');
    try {
      const response = await authAPI.resendOTP({ email });
      // Update demo OTP display and reset timers
      const newOTP = response.data.otp || '';
      if (newOTP && newOTP !== currentOTP) {
        // Show visual feedback that OTP changed
        setOtpUpdated(true);
        setTimeout(() => setOtpUpdated(false), 3000);
      }
      setCurrentOTP(newOTP);
      setExpiresIn(response.data.expiresInSec ?? 600);
      setExpired(false);
      setOtp(['', '', '', '', '', '']);
      if (inputRefs.current[0]) inputRefs.current[0].focus();
      // Respect server rate-limit headers when present
      const retryAfter = Number(response.headers?.['retry-after']);
      const rlRemaining = Number(response.headers?.['x-ratelimit-remaining'] ?? response.headers?.['ratelimit-remaining']);
      if (Number.isFinite(retryAfter) && retryAfter > 0) {
        setResendCooldown(Math.ceil(retryAfter));
      } else {
        // Keep the optimistic 30s cooldown already started
      }
      
      // Security: Always show generic message to prevent account enumeration
      // Even if we received a new OTP in demo mode, don't reveal account existence
      if (Number.isFinite(rlRemaining) && rlRemaining <= 0) {
        setNotice('Resend limit reached. Please wait before trying again.');
      } else {
        // Generic message that doesn't leak whether account exists
        setNotice('If the email is registered, a new verification code has been sent.');
      }
    } catch (err) {
      // Do not reveal existence of email; show neutral notice by default
      if (err?.response?.status === 429) {
        const retryAfter = Number(err.response.headers?.['retry-after']);
        if (Number.isFinite(retryAfter) && retryAfter > 0) setResendCooldown(Math.ceil(retryAfter));
        setError(err.response.data?.message || 'Too many attempts. Please wait and try again.');
      } else {
        // Keep the optimistic cooldown to throttle UI even on transient errors
        setNotice('If an account exists with that email, a new code has been sent.');
      }
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Invalid Request</h1>
            <p className="auth-subtitle">Please start the password reset process</p>
          </div>
          <Link to="/forgot-password" className="btn btn-primary btn-modern" style={{ width: '100%', textDecoration: 'none' }}>
            Go to Forgot Password
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container auth-container-verify-otp">
      <div className="auth-card auth-card-animated">
        {!success ? (
          <>
            <div className="auth-header">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <div className="icon-wrapper icon-wrapper-primary icon-wrapper-pulse" style={{ width: '80px', height: '80px' }}>
                  <ShieldCheckIcon className="icon-xl" />
                </div>
              </div>
              <h1 className="auth-title">Verify Your Identity</h1>
              <p className="auth-subtitle" style={{ marginBottom: '0.5rem' }}>
                Enter the 6-digit code sent to
              </p>
              <p style={{ fontWeight: '600', color: '#0ea5e9', marginBottom: '0' }}>
                {email}
              </p>
            </div>

            {currentOTP && (
              <div className="alert" style={{ 
                marginBottom: '1.5rem',
                padding: '1rem',
                backgroundColor: otpUpdated ? '#d1fae5' : '#fffbeb',
                border: otpUpdated ? '2px solid #10b981' : '1px solid #fde68a',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                animation: 'pulse 2s ease-in-out infinite',
                transition: 'all 0.3s ease'
              }}>
                <p style={{ fontWeight: '600', marginBottom: '0.5rem', color: otpUpdated ? '#065f46' : '#92400e' }}>
                  Demo Mode - Your OTP{otpUpdated ? ' (Updated!)' : ':'}  
                </p>
                <p style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  color: otpUpdated ? '#047857' : '#b45309',
                  letterSpacing: '0.5rem',
                  textAlign: 'center',
                  margin: 0,
                  fontFamily: 'monospace',
                  transition: 'color 0.3s ease'
                }}>
                  {currentOTP}
                </p>
              </div>
            )}

            {error && (
              <div className="alert alert-error alert-slide-down" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircleIcon className="icon-md" />
                {error}
              </div>
            )}

            {notice && (
              <div className="alert" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#ecfeff', border: '1px solid #bae6fd', color: '#0369a1' }}>
                <CheckCircleIcon className="icon-md" />
                {notice}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="otp-input-container" style={{ marginBottom: '1.5rem' }}>
                <div className="otp-inputs" style={{
                  display: 'flex',
                  gap: '0.5rem',
                  justifyContent: 'center'
                }}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="otp-input"
                      style={{
                        width: '3rem',
                        height: '3.5rem',
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        textAlign: 'center',
                        border: '2px solid',
                        borderColor: digit ? '#0ea5e9' : '#e2e8f0',
                        borderRadius: '0.75rem',
                        backgroundColor: digit ? '#f0f9ff' : '#f8fafc',
                        transition: 'all 0.2s ease',
                        fontFamily: 'monospace'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#0ea5e9';
                        e.target.style.boxShadow = '0 0 0 4px rgba(14, 165, 233, 0.1)';
                      }}
                      onBlur={(e) => {
                        if (!digit) {
                          e.target.style.borderColor = '#e2e8f0';
                        }
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-modern btn-submit-animated" 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%' }}
                disabled={loading || expired || otp.join('').length !== 6}
              >
                {loading ? (
                  <>
                    <SpinnerIcon className="icon-md icon-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <KeyIcon className="icon-md" />
                    <span>Verify Code</span>
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>
                  {expired ? 'Code expired.' : 'Didn\'t receive the code?'}
                </p>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                  Code expires in {Math.max(0, Math.floor(expiresIn / 60)).toString().padStart(2, '0')}:{(expiresIn % 60).toString().padStart(2, '0')}
                </p>
                <button
                  type="button"
                  onClick={handleResend}
                  className="auth-link"
                  disabled={resending || resendCooldown > 0}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: resending || resendCooldown > 0 ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    padding: '0.5rem',
                    opacity: resending || resendCooldown > 0 ? 0.6 : 1
                  }}
                >
                  {resending ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <SpinnerIcon className="icon-sm icon-spin" /> Resending...
                    </span>
                  ) : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>
            </form>

            <div className="auth-footer" style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
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
            <h1 className="auth-title" style={{ marginBottom: '1rem' }}>Verification Successful!</h1>
            <p className="auth-subtitle" style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Redirecting you to reset your password...
            </p>
            
            <div className="loading" style={{ justifyContent: 'center', padding: '1rem 0' }}>
              <SpinnerIcon className="icon-lg icon-spin" style={{ color: '#0ea5e9' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyOTP;
