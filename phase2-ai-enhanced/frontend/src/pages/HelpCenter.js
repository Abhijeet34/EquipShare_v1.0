import React from 'react';
import { Link } from 'react-router-dom';
import { RocketIcon, CompassIcon, FileTextIcon, ClipboardIcon, BookOpenIcon, HelpCircleIcon, MessageCircleIcon, LightbulbIcon } from '../components/Icons';

const HelpCenter = () => {
  const guides = [
    {
      IconComponent: RocketIcon,
      title: 'Getting Started',
      description: 'Learn the basics of using EquipShare',
      content: 'Create an account, browse equipment, and make your first request. Our platform is designed to be intuitive and easy to use for all users.'
    },
    {
      IconComponent: CompassIcon,
      title: 'Browse Equipment',
      description: 'Find the right equipment for your needs',
      content: 'Use our search and filter features to quickly find equipment. Check availability, condition, and specifications before requesting.'
    },
    {
      IconComponent: FileTextIcon,
      title: 'Making Requests',
      description: 'Step-by-step guide to requesting equipment',
      content: 'Select equipment, specify dates, provide purpose, and submit. Track your request status in real-time and get notifications.'
    },
    {
      IconComponent: ClipboardIcon,
      title: 'Track Your Requests',
      description: 'Monitor all your borrowing activity',
      content: 'View pending, approved, and completed requests. Manage returns, request extensions, and maintain your borrowing history.'
    },
    {
      IconComponent: BookOpenIcon,
      title: 'Usage Guidelines',
      description: 'Understand borrowing policies and best practices',
      content: 'Review our comprehensive guidelines on equipment care, return policies, and user responsibilities.',
      link: '/guidelines'
    },
    {
      IconComponent: HelpCircleIcon,
      title: 'FAQ',
      description: 'Quick answers to common questions',
      content: 'Browse our frequently asked questions organized by category for instant answers to your queries.',
      link: '/faq'
    }
  ];

  return (
    <div className="container" style={{ padding: '3rem 1.25rem', position: 'relative' }}>
      {/* Animated background elements */}
      <div style={{
        position: 'fixed',
        top: '10%',
        right: '5%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 20s ease-in-out infinite',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'fixed',
        bottom: '10%',
        left: '5%',
        width: '350px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 15s ease-in-out infinite reverse',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 4rem', position: 'relative', zIndex: 1 }}>
        <div className="icon-wrapper icon-wrapper-primary" style={{ width: '80px', height: '80px', margin: '0 auto 1rem', fontSize: '2.5rem' }}>
          <LightbulbIcon className="icon-xl" />
        </div>
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
          Help Center
        </h1>
        <p style={{ fontSize: '1.125rem', color: '#64748b', lineHeight: '1.7' }}>
          Find guides, tutorials, and resources to help you make the most of EquipShare
        </p>
      </div>

      {/* Quick Guides */}
      <section style={{ marginBottom: '4rem', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '2rem', color: '#0f172a', textAlign: 'center' }}>
          How Can We Help?
        </h2>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {guides.map((guide, index) => {
            const Component = guide.link ? Link : 'div';
            const props = guide.link ? { to: guide.link } : {};
            
            return (
              <Component
                key={index}
                {...props}
                className="card"
                style={{ 
                  textDecoration: 'none', 
                  color: 'inherit',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  transition: 'all 0.3s ease',
                  cursor: guide.link ? 'pointer' : 'default',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div className="icon-wrapper icon-wrapper-primary" style={{ 
                  marginBottom: '1rem',
                  width: '64px',
                  height: '64px'
                }}>
                  <guide.IconComponent className="icon-lg" />
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#0f172a' }}>
                  {guide.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.75rem', fontWeight: '500' }}>
                  {guide.description}
                </p>
                <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6', flex: 1 }}>
                  {guide.content}
                </p>
                {guide.link && (
                  <div style={{ marginTop: '1rem', color: '#0ea5e9', fontSize: '0.9rem', fontWeight: '600' }}>
                    Learn more →
                  </div>
                )}
              </Component>
            );
          })}
        </div>
      </section>

      {/* Contact Support */}
      <section 
        className="card"
        style={{ 
          textAlign: 'center', 
          maxWidth: '700px', 
          margin: '0 auto',
          background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
          color: 'white',
          padding: '3rem 2rem',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div className="icon-wrapper" style={{ width: '64px', height: '64px', margin: '0 auto 1rem', background: 'rgba(255, 255, 255, 0.2)', color: 'white' }}>
          <MessageCircleIcon className="icon-lg" />
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '1rem', color: 'white' }}>
          Still need help?
        </h2>
        <p style={{ fontSize: '1rem', marginBottom: '2rem', opacity: '0.95' }}>
          Our support team is here to assist you with any questions or concerns
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link 
            to="/contact" 
            className="btn btn-outline"
            style={{ 
              backgroundColor: 'white', 
              color: '#0ea5e9',
              borderColor: 'white',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            Contact Support
          </Link>
          <a 
            href="mailto:support@equipshare.edu" 
            className="btn"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)', 
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            Email Us
          </a>
        </div>
      </section>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default HelpCenter;
