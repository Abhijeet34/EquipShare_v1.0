import React from 'react';
import { ShieldCheckIcon, LockIcon, InfoIcon, MailIcon } from '../components/Icons';

const PrivacyPolicy = () => {
  const lastUpdated = "November 9, 2025";

  const sections = [
    {
      IconComponent: InfoIcon,
      title: "Information We Collect",
      content: [
        "We collect information you provide directly to us, including your name, email address, student/faculty ID, and borrowing history.",
        "Usage data such as equipment browsing patterns, request timestamps, and interaction logs are automatically collected to improve our service.",
        "Device and browser information is collected for security and optimization purposes."
      ]
    },
    {
      IconComponent: LockIcon,
      title: "How We Use Your Information",
      content: [
        "To process and manage equipment borrowing requests and track availability.",
        "To communicate with you about your requests, account status, and system updates.",
        "To improve our platform's functionality and user experience.",
        "To ensure compliance with institutional policies and prevent misuse.",
        "To generate anonymized analytics for administrative reporting."
      ]
    },
    {
      IconComponent: ShieldCheckIcon,
      title: "Data Security",
      content: [
        "We implement industry-standard security measures including encryption, secure authentication, and regular security audits.",
        "Access to personal data is restricted to authorized personnel only.",
        "We use secure HTTPS connections for all data transmission.",
        "Regular backups are performed to prevent data loss.",
        "We comply with educational institution data protection policies."
      ]
    },
    {
      IconComponent: MailIcon,
      title: "Your Rights",
      content: [
        "You have the right to access, correct, or delete your personal information.",
        "You can request a copy of all data we hold about you.",
        "You may opt-out of non-essential communications.",
        "You can close your account at any time by contacting support.",
        "If you have privacy concerns, please contact us at support@equipshare.edu."
      ]
    }
  ];

  return (
    <div className="container" style={{ padding: '3rem 1.25rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 4rem' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: '800', 
          background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #14b8a6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '1rem',
          letterSpacing: '-0.03em'
        }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: '1rem', color: '#64748b', marginBottom: '0.5rem' }}>
          Your privacy is important to us. This policy explains how we collect, use, and protect your information.
        </p>
        <p style={{ fontSize: '0.875rem', color: '#94a3b8', fontStyle: 'italic' }}>
          Last updated: {lastUpdated}
        </p>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {sections.map((section, index) => (
          <div 
            key={index}
            className="card" 
            style={{ 
              marginBottom: '2rem',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
              <div className="icon-wrapper icon-wrapper-primary" style={{ flexShrink: 0 }}>
                <section.IconComponent className="icon-lg" />
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#0f172a' }}>
                  {section.title}
                </h2>
                <ul style={{ 
                  fontSize: '0.95rem', 
                  color: '#475569', 
                  lineHeight: '1.8',
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  {section.content.map((item, idx) => (
                    <li key={idx} style={{ 
                      marginBottom: '0.75rem',
                      paddingLeft: '1.5rem',
                      position: 'relative'
                    }}>
                      <span style={{
                        position: 'absolute',
                        left: 0,
                        top: '0.6rem',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)'
                      }}></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}

        <div 
          className="card"
          style={{ 
            marginTop: '3rem',
            background: 'linear-gradient(135deg, #eff6ff 0%, #f3f4f6 100%)',
            border: '1px solid #dbeafe',
            textAlign: 'center'
          }}
        >
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', color: '#0f172a' }}>
            Questions about our Privacy Policy?
          </h3>
          <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: '1.6', marginBottom: '1.25rem' }}>
            If you have any questions or concerns about how we handle your data, please don't hesitate to reach out.
          </p>
          <a 
            href="/contact" 
            className="btn btn-modern"
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
              textDecoration: 'none'
            }}
          >
            <span>Contact Us</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
