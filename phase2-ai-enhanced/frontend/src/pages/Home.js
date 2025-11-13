import React from 'react';
import { useNavigate } from 'react-router-dom';

// SVG Icon Components
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

const ClipboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const BarChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10"/>
    <line x1="18" y1="20" x2="18" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="16"/>
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <SearchIcon />,
      title: 'Equipment Browsing',
      description: 'Explore available equipment with real-time availability status and detailed specifications'
    },
    {
      icon: <ClipboardIcon />,
      title: 'Request Management',
      description: 'Submit and track borrowing requests with an intuitive workflow and instant notifications'
    },
    {
      icon: <CheckCircleIcon />,
      title: 'Approval Workflow',
      description: 'Streamlined approval process with role-based permissions for efficient management'
    },
    {
      icon: <BarChartIcon />,
      title: 'Status Tracking',
      description: 'Monitor your borrowing history and current requests in real-time'
    },
    {
      icon: <LockIcon />,
      title: 'Role-Based Access',
      description: 'Secure access control with distinct permissions for students, faculty, and admins'
    },
    {
      icon: <FilterIcon />,
      title: 'Advanced Search',
      description: 'Powerful filters to quickly find the exact equipment you need'
    }
  ];

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-video-container">
          <video autoPlay loop muted playsInline className="hero-video">
            <source src="/videos/hero-video.mp4" type="video/mp4" />
          </video>
          <div className="hero-overlay"></div>
        </div>
        <div className="container hero-content-wrapper">
          <div className="hero-content">
            <h1 className="hero-title">Welcome to EquipShare</h1>
            <p className="hero-subtitle">Smart equipment lending platform for schools</p>
            <p className="hero-description">
              Streamline equipment management with our comprehensive platform. 
              Browse available resources, submit requests, and track your borrowing history—all in one place.
            </p>
            <div className="hero-cta">
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}>
                Get Started
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => navigate('/equipment')}>
                Browse Equipment
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Everything you need</h2>
            <p className="section-subtitle">Powerful features designed for efficient equipment management</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
