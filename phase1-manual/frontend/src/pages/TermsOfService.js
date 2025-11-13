import React from 'react';
import { FileTextIcon, CheckCircleIcon, AlertCircleIcon, ShieldCheckIcon } from '../components/Icons';

const TermsOfService = () => {
  const lastUpdated = "November 9, 2025";

  const sections = [
    {
      IconComponent: FileTextIcon,
      title: "Acceptance of Terms",
      content: [
        "By accessing and using EquipShare, you accept and agree to be bound by these Terms of Service.",
        "These terms apply to all users including students, faculty, and administrative staff.",
        "If you do not agree to these terms, you may not use our services.",
        "We reserve the right to modify these terms at any time with notice to users."
      ]
    },
    {
      IconComponent: CheckCircleIcon,
      title: "User Responsibilities",
      content: [
        "You must provide accurate and complete information when registering and making requests.",
        "You are responsible for maintaining the confidentiality of your account credentials.",
        "Equipment must be used responsibly and returned in the same condition as received.",
        "You must comply with all institutional policies regarding equipment use.",
        "Any damage or loss of equipment may result in financial liability.",
        "Misuse of the platform or equipment may result in account suspension or termination."
      ]
    },
    {
      IconComponent: AlertCircleIcon,
      title: "Service Availability and Limitations",
      content: [
        "We strive to maintain 24/7 availability but do not guarantee uninterrupted service.",
        "Scheduled maintenance may temporarily interrupt access to the platform.",
        "Equipment availability is subject to real-time changes and institutional policies.",
        "We reserve the right to deny or cancel requests at our discretion.",
        "The platform is provided 'as is' without warranties of any kind."
      ]
    },
    {
      IconComponent: ShieldCheckIcon,
      title: "Liability and Indemnification",
      content: [
        "EquipShare is not liable for any direct, indirect, or consequential damages arising from platform use.",
        "Users indemnify EquipShare from claims resulting from their violation of these terms.",
        "Equipment damage or loss is the responsibility of the borrowing user.",
        "We are not responsible for delays or failures due to circumstances beyond our control.",
        "Maximum liability is limited to the extent permitted by law."
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
          Terms of Service
        </h1>
        <p style={{ fontSize: '1rem', color: '#64748b', marginBottom: '0.5rem' }}>
          Please read these terms carefully before using EquipShare.
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
            padding: '2rem',
            background: 'linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%)',
            border: '1px solid #fde047'
          }}
        >
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div className="icon-wrapper icon-wrapper-warning" style={{ flexShrink: 0 }}>
              <AlertCircleIcon className="icon-lg" />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', color: '#0f172a' }}>
                Important Notice
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: '1.6', margin: 0 }}>
                By continuing to use EquipShare, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. 
                If you have any questions or concerns, please <a href="/contact" style={{ color: '#0ea5e9', fontWeight: '600', textDecoration: 'none' }}>contact our support team</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
