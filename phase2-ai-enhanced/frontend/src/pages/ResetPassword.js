import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { authAPI } from '../api';
import { KeyIcon, LockIcon, AlertCircleIcon, SpinnerIcon, CheckCircleIcon, EyeIcon, EyeOffIcon } from '../components/Icons';

const ResetPassword = ({ setUser }) => {
  const [password, setPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: 'Too weak', ok: false, checks: {} });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

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
    const score = checks.length ? variety : 0; // 0..4
    const ok = checks.length && checks.nospace && variety === 4;
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

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!passwordStrength.ok) {
      setError('Password does not meet the required complexity.');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.resetPassword(token, { password });
      setSuccess(true);
      setLoading(false);
      
      // Auto login after successful reset
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        
        setTimeout(() => {
          navigate('/equipment');
        }, 2000);
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to reset password');
    }
  };

  return (
    <div className="auth-container auth-container-reset-password">
      <div className="auth-card auth-card-animated">
        {!success ? (
          <>
            <div className="auth-header">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <div className="icon-wrapper icon-wrapper-primary icon-wrapper-pulse" style={{ width: '80px', height: '80px' }}>
                  <KeyIcon className="icon-xl" />
                </div>
              </div>
              <h1 className="auth-title">Reset Password</h1>
              <p className="auth-subtitle">Enter your new password below</p>
            </div>

            {error && (
              <div className="alert alert-error alert-slide-down" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircleIcon className="icon-md" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="input-with-icon input-with-icon-animated" style={{ position: 'relative' }}>
                  <LockIcon className="icon-md input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control form-control-modern"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => { const pwd = e.target.value; setPassword(pwd); setPasswordStrength(evaluatePassword(pwd)); }}
                    required
                    autoFocus
                    minLength={8}
                    maxLength={64}
                    style={{ paddingRight: '3rem' }}
                    aria-describedby="reset-password-hint"
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
              </div>
              <div id="reset-password-hint" style={{ marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '0.4rem' }}>
                  {[0,1,2,3,4].map(i => (
                    <div key={i} style={{ flex: 1, height: 8, borderRadius: 9999, background: (password && password.length > 0 && i <= passwordStrength.score) ? strengthProps(passwordStrength.score).color : '#e2e8f0' }} />
                  ))}
                  <span style={{
                    marginLeft: '8px',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    background: (password && password.length > 0) ? strengthProps(passwordStrength.score).bg : '#f1f5f9',
                    color: (password && password.length > 0) ? strengthProps(passwordStrength.score).color : '#94a3b8',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}>
                    {(password && password.length > 0) ? strengthProps(passwordStrength.score).label : 'Create a strong password'}
                  </span>
                </div>
                <small style={{ color: '#475569' }}>8–64 chars, must include upper, lower, number, special, and no spaces.</small>
              </div>
              
              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label className="form-label">Confirm Password</label>
                <div className="input-with-icon input-with-icon-animated" style={{ position: 'relative' }}>
                  <LockIcon className="icon-md input-icon" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-control form-control-modern"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={{ 
                      paddingRight: '3rem',
                      borderColor: confirmPassword && password && confirmPassword !== password ? '#ef4444' : undefined
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOffIcon className="icon-md" /> : <EyeIcon className="icon-md" />}
                  </button>
                </div>
                {confirmPassword && password && (
                  <small style={{ 
                    display: 'block',
                    marginTop: '0.5rem',
                    color: confirmPassword === password ? '#16a34a' : '#ef4444',
                    fontWeight: '500'
                  }}>
                    {confirmPassword === password ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </small>
                )}
              </div>

              <button
                type="submit" 
                className="btn btn-primary btn-modern btn-submit-animated" 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <SpinnerIcon className="icon-md icon-spin" />
                    <span>Resetting...</span>
                  </>
                ) : (
                  <span>Reset Password</span>
                )}
              </button>
            </form>

            <div className="auth-footer">
              <p className="text-center text-sm">
                Remember your password? <Link to="/login" className="auth-link">Login</Link>
              </p>
            </div>
          </>
        ) : (
          <div className="auth-success-container">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <div className="icon-wrapper icon-wrapper-success icon-success-checkmark" style={{ width: '80px', height: '80px' }}>
                <CheckCircleIcon className="icon-xl" />
              </div>
            </div>
            <h1 className="auth-title" style={{ marginBottom: '1rem' }}>Password Reset Successfully!</h1>
            <p className="auth-subtitle" style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Your password has been reset successfully. You will be redirected to the equipment page in a moment.
            </p>
            
            <div className="loading" style={{ justifyContent: 'center', padding: '1rem 0' }}>
              <SpinnerIcon className="icon-lg icon-spin" style={{ color: '#0ea5e9' }} />
              <span style={{ color: '#0ea5e9', fontWeight: '600' }}>Logging you in...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
