import React from 'react';
import { Link } from 'react-router-dom';

// Unique animated SVG icon for footer
const FooterZapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    <circle cx="12" cy="12" r="11" stroke="url(#footer-gradient)" strokeWidth="0.5" opacity="0.3"/>
    <defs>
      <linearGradient id="footer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#0ea5e9', stopOpacity: 1 }} />
        <stop offset="50%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#14b8a6', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
  </svg>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <div className="footer-logo-icon">
                <FooterZapIcon />
              </div>
              <span>EquipShare</span>
            </div>
            <p>Simplifying equipment sharing for educational institutions. Manage, request, and track equipment effortlessly.</p>
          </div>

          <div className="footer-section">
            <h3>Quick Links</h3>
            <div className="footer-links">
              <Link to="/equipment">Browse Equipment</Link>
              <Link to="/requests">My Requests</Link>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </div>
          </div>

          <div className="footer-section">
            <h3>Resources</h3>
            <div className="footer-links">
              <Link to="/help">Help Center</Link>
              <Link to="/guidelines">Usage Guidelines</Link>
              <Link to="/faq">FAQ</Link>
              <Link to="/contact">Contact Support</Link>
            </div>
          </div>

          <div className="footer-section">
            <h3>Contact</h3>
            <div className="footer-links">
              <p>Email: support@equipshare.edu</p>
              <p>Phone: (555) 123-4567</p>
              <p>Hours: Mon-Fri, 9AM-5PM</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            &copy; {currentYear} EquipShare. All rights reserved. | {' '}
            <Link to="/privacy" style={{ color: 'rgba(255, 255, 255, 0.85)', textDecoration: 'none', transition: 'color 0.2s ease' }}
              onMouseEnter={(e) => e.target.style.color = '#06b6d4'}
              onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.85)'}>
              Privacy Policy
            </Link>
            {' | '}
            <Link to="/terms" style={{ color: 'rgba(255, 255, 255, 0.85)', textDecoration: 'none', transition: 'color 0.2s ease' }}
              onMouseEnter={(e) => e.target.style.color = '#06b6d4'}
              onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.85)'}>
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
