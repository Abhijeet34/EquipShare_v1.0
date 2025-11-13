import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { authAPI } from '../api';
import { UserPlusIcon, UserIcon, LockIcon, AlertCircleIcon, SpinnerIcon, EyeIcon, EyeOffIcon } from '../components/Icons';
import TermsOfService from './TermsOfService';
import PrivacyPolicy from './PrivacyPolicy';

const Register = ({ setUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: 'Too weak', ok: false, checks: {} });
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [captchaEnabledAt, setCaptchaEnabledAt] = useState(0);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const recaptchaRef = useRef();
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
        console.debug('[SECURITY] CAPTCHA reset on navigation to Register');
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

  const evaluatePassword = (pwd) => {
    const checks = {
      length: pwd.length >= 8 && pwd.length <= 64,
      lower: /[a-z]/.test(pwd),
      upper: /[A-Z]/.test(pwd),
      digit: /\d/.test(pwd),
      special: /[!@#$%^&*()_+\-={}[\]\\|:;"'<>?,./`~]/.test(pwd),
      nospace: !/\s/.test(pwd)
    };
    const variety = ['lower','upper','digit','special'].reduce((n,k)=> n + (checks[k] ? 1 : 0), 0);
    const score = checks.length ? variety : 0; // 0..4, no score if length not met
    const ok = checks.length && checks.nospace && variety === 4; // all categories present
    return { score, ok, checks };
  };

  const strengthProps = (score) => {
    const map = [
      { color: '#ef4444', bg: 'rgba(239,68,68,0.15)', label: 'Too weak' },
      { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', label: 'Weak' },
      { color: '#60a5fa', bg: 'rgba(96,165,250,0.15)', label: 'Fair' },
      { color: '#22c55e', bg: 'rgba(34,197,94,0.15)', label: 'Strong' },
      { color: '#16a34a', bg: 'rgba(22,163,74,0.15)', label: 'Very strong' }
    ];
    return map[Math.max(0, Math.min(4, score))];
  };

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

    if (!acceptedTerms) {
      setError('Please accept the Terms of Service and Privacy Policy');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.register({ ...formData, recaptchaToken, consent: { termsAccepted: true, at: new Date().toISOString() } });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      // Small delay for smooth UX
      setTimeout(() => {
        navigate('/equipment');
      }, 300);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Registration failed');
      // Reset reCAPTCHA on error
      try {
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
          setRecaptchaToken('');
        }
      } catch (e) {
        console.debug('CAPTCHA reset failed:', e.message);
        setRecaptchaToken('');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div className="icon-wrapper icon-wrapper-primary" style={{ width: '80px', height: '80px' }}>
              <UserPlusIcon className="icon-xl" />
            </div>
          </div>
          <h1 className="auth-title">Register</h1>
          <p className="auth-subtitle">Create your EquipShare account</p>
        </div>
        {error && (
          <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircleIcon className="icon-md" />
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Name</label>
            <div className="input-with-icon">
              <UserIcon className="icon-md input-icon" />
              <input
                type="text"
                className="form-control form-control-modern"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                pattern="[A-Za-z\s'-]+"
                title="Name should only contain letters, spaces, hyphens, and apostrophes"
                required
              />
            </div>
          </div>
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
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => { const pwd = e.target.value; setFormData({ ...formData, password: pwd }); setPasswordStrength(evaluatePassword(pwd)); }}
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
                minLength={8}
                maxLength={64}
                style={{ paddingRight: '3rem' }}
                aria-describedby="password-hint"
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
            <div id="password-hint" style={{ marginTop: '0.5rem' }}>
              {/* Segmented meter */}
              <div style={{ display: 'flex', gap: '4px', marginBottom: '0.4rem' }}>
                {[0,1,2,3,4].map(i => (
                  <div key={i} style={{ flex: 1, height: 8, borderRadius: 9999, background: (formData.password && formData.password.length > 0 && i <= passwordStrength.score) ? strengthProps(passwordStrength.score).color : '#e2e8f0' }} />
                ))}
                <span style={{
                  marginLeft: '8px',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  background: (formData.password && formData.password.length > 0) ? strengthProps(passwordStrength.score).bg : '#f1f5f9',
                  color: (formData.password && formData.password.length > 0) ? strengthProps(passwordStrength.score).color : '#94a3b8',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  {(formData.password && formData.password.length > 0) ? strengthProps(passwordStrength.score).label : 'Create a strong password'}
                </span>
              </div>
              <small style={{ color: '#475569' }}>8–64 chars, must include upper, lower, number, special, and no spaces.</small>
              <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '6px 12px', margin: '8px 0 0', padding: 0, listStyle: 'none', color: '#475569', fontSize: '0.8rem' }}>
                {[
                  ['length','Min length 8'],
                  ['upper','Uppercase'],
                  ['lower','Lowercase'],
                  ['digit','Number'],
                  ['special','Special char'],
                  ['nospace','No spaces']
                ].map(([k,label]) => (
                  <li key={k} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <svg width="14" height="14" viewBox="0 0 20 20" fill={passwordStrength.checks[k] ? '#16a34a' : '#cbd5e1'}>
                      <path d="M7.629 15.314L3.314 11l1.372-1.372 2.943 2.943 7.686-7.686L16.686 6z" />
                    </svg>
                    <span>{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '0.5rem' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontWeight: 400 }}>
              <span
                role="checkbox"
                aria-checked={acceptedTerms}
                tabIndex={0}
                onClick={() => setAcceptedTerms(!acceptedTerms)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setAcceptedTerms(!acceptedTerms); } }}
                style={{
                  width: '18px', height: '18px', borderRadius: '4px', border: '2px solid #94a3b8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  marginTop: '0.15rem', cursor: 'pointer', transition: 'all 180ms ease',
                  background: acceptedTerms ? 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)' : '#fff',
                  borderColor: acceptedTerms ? '#0ea5e9' : '#94a3b8',
                  boxShadow: acceptedTerms ? '0 0 0 4px rgba(14,165,233,0.12)' : 'none'
                }}
              >
                {acceptedTerms && (
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="#fff" style={{ transform: 'scale(1)', transition: 'transform 180ms ease' }}>
                    <path d="M7.629 15.314L3.314 11l1.372-1.372 2.943 2.943 7.686-7.686L16.686 6z" />
                  </svg>
                )}
              </span>
              <span style={{ fontSize: '0.9rem', color: '#334155' }}>
                I agree to the <a href="/terms-of-service" className="auth-link" onClick={(e) => { e.preventDefault(); setShowTerms(true); }}>Terms of Service</a> and <a href="/privacy-policy" className="auth-link" onClick={(e) => { e.preventDefault(); setShowPrivacy(true); }}>Privacy Policy</a>.
              </span>
            </label>
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
            disabled={loading || !isEmailValid || !recaptchaToken || !acceptedTerms || !passwordStrength.ok}
          >
            {loading ? (
              <>
                <SpinnerIcon className="icon-md icon-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <UserPlusIcon className="icon-md" />
                <span>Register</span>
              </>
            )}
          </button>
        </form>
        <div className="auth-footer">
          <p className="text-center text-sm">
            Already have an account? <Link to="/login" className="auth-link">Login</Link>
          </p>
        </div>
      </div>

      {(showTerms || showPrivacy) && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.55)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => { setShowTerms(false); setShowPrivacy(false); }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', width: 'min(960px, 100%)', maxHeight: '85vh', overflow: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ position: 'sticky', top: 0, background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1 }}>
              <strong>{showTerms ? 'Terms of Service' : 'Privacy Policy'}</strong>
              <button onClick={() => { setShowTerms(false); setShowPrivacy(false); }} style={{ background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#475569' }} aria-label="Close">×</button>
            </div>
            <div style={{ padding: '0.5rem 0 1rem 0' }}>
              {showTerms ? <TermsOfService /> : <PrivacyPolicy />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
