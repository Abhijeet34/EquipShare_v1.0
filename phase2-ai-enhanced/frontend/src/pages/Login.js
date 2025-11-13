import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { authAPI } from '../api';
import { LogInIcon, UserIcon, LockIcon, AlertCircleIcon, SpinnerIcon, EyeIcon, EyeOffIcon } from '../components/Icons';

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [captchaEnabledAt, setCaptchaEnabledAt] = useState(0);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const recaptchaRef = useRef();
  const errorTimerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Ensure fresh captcha on mount and when navigating to this page
  useEffect(() => {
    // Clear any stale token from previous page visits
    setRecaptchaToken('');
    setIsEmailValid(false);
    
    // Reset captcha widget immediately and synchronously on navigation
    if (recaptchaRef.current) {
      try {
        recaptchaRef.current.reset();
        console.debug('[SECURITY] CAPTCHA reset on navigation to Login');
      } catch (e) {
        // Widget may not be loaded yet - schedule a retry
        console.debug('CAPTCHA not ready, scheduling reset:', e.message);
        const t = setTimeout(() => {
          if (recaptchaRef.current) {
            try {
              recaptchaRef.current.reset();
            } catch (err) {
              console.debug('CAPTCHA reset retry failed:', err.message);
            }
          }
        }, 100);
        return () => clearTimeout(t);
      }
    }
  }, [location.pathname]);

  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear any pending auto-dismiss timers
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }

    if (!isEmailValid) {
      setError('Please enter a valid email address');
      return;
    }

    if (!recaptchaToken) {
      setError('Please complete the reCAPTCHA verification');
      return;
    }

    // Clear error only when actually attempting login
    setError('');
    setLoading(true);
    try {
      const response = await authAPI.login({ ...formData, recaptchaToken });
      
      // Clear any existing error on successful login
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
      setError('');
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      
      // Check for redirect parameter in URL
      const searchParams = new URLSearchParams(location.search);
      const redirect = searchParams.get('redirect');
      
      // Navigate after brief delay
      setTimeout(() => {
        navigate(redirect || '/equipment');
      }, 300);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Login failed');
      
      // Reset reCAPTCHA on error
      try {
        if (recaptchaRef.current) recaptchaRef.current.reset();
      } catch (e) {
        console.debug('CAPTCHA reset failed:', e.message);
      }
      setRecaptchaToken('');
      
      // Auto-dismiss error after 8 seconds
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
      errorTimerRef.current = setTimeout(() => setError(''), 8000);
    }
  };

  return (
    <div className="auth-container auth-container-login">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div className="icon-wrapper icon-wrapper-primary" style={{ width: '80px', height: '80px' }}>
              <LogInIcon className="icon-xl" />
            </div>
          </div>
          <h1 className="auth-title">Login</h1>
          <p className="auth-subtitle">Welcome back to EquipShare</p>
        </div>
        {error && (
          <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'opacity 300ms ease' }}>
            <AlertCircleIcon className="icon-md" />
            <span style={{ flex: 1 }}>{error}</span>
            <button onClick={() => setError('')} style={{ background: 'transparent', border: 'none', color: '#334155', cursor: 'pointer', fontSize: '0.9rem' }} aria-label="Dismiss">×</button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-with-icon">
              <UserIcon className="icon-md input-icon" />
              <input
                type="email"
                className="form-control form-control-modern"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({ ...formData, email: val });
                  const valid = validateEmail(val);
                  if (valid && !isEmailValid) setCaptchaEnabledAt(Date.now());
                  setIsEmailValid(valid);
                  // Don't clear error when email changes - let user read it
                  try {
                    if (recaptchaRef.current) {
                      recaptchaRef.current.reset();
                      setRecaptchaToken('');
                    }
                  } catch (e) {
                    // CAPTCHA widget not ready or unmounting
                    setRecaptchaToken('');
                  }
                }}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon" style={{ position: 'relative' }}>
              <LockIcon className="icon-md input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                className="form-control form-control-modern"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                onKeyDown={(e) => {
                  if (e.getModifierState) {
                    setCapsLockOn(e.getModifierState('CapsLock'));
                  }
                }}
                onKeyUp={(e) => {
                  if (e.getModifierState) {
                    setCapsLockOn(e.getModifierState('CapsLock'));
                  }
                }}
                onBlur={() => setCapsLockOn(false)}
                required
                style={{ paddingRight: '3rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#0ea5e9'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon className="icon-md" /> : <EyeIcon className="icon-md" />}
              </button>
            </div>
            {capsLockOn && (
              <div style={{
                marginTop: '0.5rem',
                padding: '0.5rem 0.75rem',
                backgroundColor: '#fef3c7',
                border: '1px solid #fbbf24',
                borderRadius: '6px',
                color: '#92400e',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <span>Caps Lock is on</span>
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
            <Link to="/forgot-password" className="auth-link forgot-password-link" style={{ fontSize: '0.875rem', textDecoration: 'none' }}>
              Forgot password?
            </Link>
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
            className="btn btn-primary btn-modern" 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%' }}
            disabled={loading || !isEmailValid || !recaptchaToken}
          >
            {loading ? (
              <>
                <SpinnerIcon className="icon-md icon-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <LogInIcon className="icon-md" />
                <span>Login</span>
              </>
            )}
          </button>
        </form>
        <div className="auth-footer">
          <p className="text-center text-sm">
            Don't have an account? <Link to="/register" className="auth-link">Register</Link>
          </p>
          
          <div className="alert" style={{ marginTop: '1rem', padding: '0.875rem', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '6px' }}>
            <p style={{ fontWeight: '600', marginBottom: '0.625rem', color: '#0369a1', fontSize: '0.875rem' }}>Demo Credentials</p>
            <div style={{ fontSize: '0.8125rem', color: '#0c4a6e', display: 'grid', gap: '0.4rem' }}>
              {[['Admin','admin@school.com','Admin@123'], ['Staff','staff@school.com','Staff@123'], ['Student','student1@school.com','Student@123']].map(([role,email,pw]) => (
                <div key={role} style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, minWidth: '60px', fontSize: '0.8125rem' }}>{role}:</span>
                  <code style={{ backgroundColor: '#e0f2fe', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{email}</code>
                  <span style={{ fontSize: '0.75rem' }}>/</span>
                  <code style={{ backgroundColor: '#e0f2fe', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{pw}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
