import React from 'react';
import { CheckCircleIcon, SpinnerIcon } from './Icons';

// Button loading state
export const ButtonLoader = ({ text = 'Processing...', className = '' }) => (
  <div className={`btn-loader ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
    <SpinnerIcon className="icon-sm" />
    <span>{text}</span>
  </div>
);

// Success message with animation
export const SuccessMessage = ({ message, onClose }) => (
  <div className="success-toast" style={{
    position: 'fixed',
    top: '80px',
    right: '20px',
    zIndex: 9999,
    animation: 'slideInRight 0.3s ease-out'
  }}>
    <div style={{
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      padding: '1rem 1.5rem',
      borderRadius: '0.75rem',
      boxShadow: '0 10px 40px rgba(16, 185, 129, 0.3), 0 4px 12px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      minWidth: '300px',
      maxWidth: '500px'
    }}>
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'scaleIn 0.3s ease-out 0.2s both'
      }}>
        <CheckCircleIcon className="icon-md" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: '600', marginBottom: '2px' }}>Success!</div>
        <div style={{ fontSize: '0.875rem', opacity: 0.95 }}>{message}</div>
      </div>
      {onClose && (
        <button 
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '4px',
            opacity: 0.8,
            fontSize: '1.25rem',
            lineHeight: 1
          }}
        >
          ×
        </button>
      )}
    </div>
  </div>
);

// Form submission overlay
export const FormSubmitOverlay = ({ message = 'Processing your request...' }) => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(15, 23, 42, 0.75)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9998,
    animation: 'fadeIn 0.2s ease-out'
  }}>
    <div style={{
      background: 'white',
      borderRadius: '1rem',
      padding: '2.5rem 3rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      textAlign: 'center',
      animation: 'scaleIn 0.3s ease-out'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        margin: '0 auto 1.5rem',
        animation: 'spin 1s linear infinite'
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          border: '4px solid #e5e7eb',
          borderTopColor: '#0ea5e9',
          borderRadius: '50%'
        }} />
      </div>
      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#0f172a', marginBottom: '0.5rem' }}>
        {message}
      </h3>
      <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
        Please wait a moment...
      </p>
    </div>
  </div>
);

// Inline form field loading
export const FieldLoader = () => (
  <div style={{
    display: 'inline-block',
    width: '16px',
    height: '16px',
    border: '2px solid #e5e7eb',
    borderTopColor: '#0ea5e9',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite'
  }} />
);

// Success checkmark animation
export const AnimatedCheck = ({ size = 64 }) => (
  <div style={{
    width: `${size}px`,
    height: `${size}px`,
    margin: '0 auto',
    position: 'relative'
  }}>
    <svg
      style={{
        width: '100%',
        height: '100%',
        strokeDasharray: '166',
        strokeDashoffset: '166',
        animation: 'checkmark 0.6s ease-out 0.3s forwards'
      }}
      viewBox="0 0 52 52"
    >
      <circle
        style={{
          strokeDasharray: '166',
          strokeDashoffset: '166',
          stroke: '#10b981',
          strokeWidth: '2',
          fill: 'none',
          animation: 'circle 0.6s ease-out forwards'
        }}
        cx="26"
        cy="26"
        r="25"
      />
      <path
        style={{
          fill: 'none',
          stroke: '#10b981',
          strokeWidth: '2',
          strokeLinecap: 'round',
          strokeDasharray: '48',
          strokeDashoffset: '48',
          animation: 'checkmark 0.4s ease-out 0.5s forwards'
        }}
        d="M14.1 27.2l7.1 7.2 16.7-16.8"
      />
    </svg>
  </div>
);

// Mini inline success indicator
export const InlineSuccess = ({ text }) => (
  <div style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#10b981',
    fontSize: '0.875rem',
    fontWeight: '500',
    animation: 'fadeInUp 0.3s ease-out'
  }}>
    <CheckCircleIcon className="icon-sm" />
    {text}
  </div>
);

// Skeleton loader for cards
export const SkeletonCard = () => (
  <div className="skeleton-card" style={{
    background: 'white',
    borderRadius: '1rem',
    padding: '1.5rem',
    animation: 'fadeIn 0.3s ease-out'
  }}>
    <div className="skeleton-shimmer" style={{
      height: '24px',
      background: '#e5e7eb',
      borderRadius: '4px',
      marginBottom: '1rem',
      width: '60%',
      animation: 'shimmer 1.5s infinite'
    }} />
    <div className="skeleton-shimmer" style={{
      height: '16px',
      background: '#e5e7eb',
      borderRadius: '4px',
      marginBottom: '0.5rem',
      animation: 'shimmer 1.5s infinite 0.1s'
    }} />
    <div className="skeleton-shimmer" style={{
      height: '16px',
      background: '#e5e7eb',
      borderRadius: '4px',
      width: '80%',
      animation: 'shimmer 1.5s infinite 0.2s'
    }} />
  </div>
);

export default {
  ButtonLoader,
  SuccessMessage,
  FormSubmitOverlay,
  FieldLoader,
  AnimatedCheck,
  InlineSuccess,
  SkeletonCard
};
