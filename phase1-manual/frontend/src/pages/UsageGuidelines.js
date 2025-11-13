import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardIcon, ClockIcon, CheckCircleIcon, ShieldCheckIcon, RefreshIcon, AlertCircleIcon, XIcon, TargetIcon, BookOpenIcon, HelpCircleIcon, ZapIcon } from '../components/Icons';

const UsageGuidelines = () => {
  const guidelines = [
    {
      IconComponent: ClipboardIcon,
      title: 'Borrowing Process',
      content: [
        'Browse the equipment catalog and check availability',
        'Submit a request with required dates and purpose',
        'Wait for approval from staff or admin (typically 24-48 hours)',
        'Collect equipment from the designated location with valid ID',
        'Inspect equipment upon receipt and report any pre-existing damage'
      ]
    },
    {
      IconComponent: ClockIcon,
      title: 'Borrowing Duration',
      content: [
        'Standard loan period is up to 14 days',
        'Weekend-only loans available for specific equipment',
        'Extensions must be requested at least 2 days before due date',
        'Maximum of one extension per loan (subject to availability)',
        'Late returns may result in suspension of borrowing privileges'
      ]
    },
    {
      IconComponent: CheckCircleIcon,
      title: 'Eligibility & Requirements',
      content: [
        'Valid student or staff ID required',
        'Must have active account in good standing',
        'No outstanding overdue equipment or unpaid fees',
        'Some specialized equipment may require training or certification',
        'Maximum of 3 concurrent active loans per user'
      ]
    },
    {
      IconComponent: ShieldCheckIcon,
      title: 'Responsibilities',
      content: [
        'Keep equipment safe and secure at all times',
        'Use equipment only for intended educational purposes',
        'Do not lend equipment to others - loans are non-transferable',
        'Store equipment in appropriate conditions',
        'Report any damage, loss, or malfunction immediately'
      ]
    },
    {
      IconComponent: RefreshIcon,
      title: 'Returns & Inspections',
      content: [
        'Return equipment on or before the due date',
        'Return all accessories and components in original condition',
        'Equipment will be inspected upon return',
        'Mark request as "Returned" in system after physical return',
        'Obtain return confirmation receipt when possible'
      ]
    },
    {
      IconComponent: AlertCircleIcon,
      title: 'Damage & Loss Policy',
      content: [
        'Report damage immediately - honesty is appreciated',
        'Normal wear and tear is expected and accepted',
        'Negligent damage may incur repair or replacement costs',
        'Lost equipment must be reported within 24 hours',
        'Replacement costs will be charged for lost items'
      ]
    },
    {
      IconComponent: XIcon,
      title: 'Prohibited Actions',
      content: [
        'Altering, modifying, or repairing equipment without authorization',
        'Using equipment for commercial purposes',
        'Removing asset tags or identification labels',
        'Subletting or lending equipment to others',
        'Using equipment in hazardous or inappropriate conditions'
      ]
    },
    {
      IconComponent: TargetIcon,
      title: 'Best Practices',
      content: [
        'Book equipment in advance, especially during peak periods',
        'Read equipment manuals and safety guidelines',
        'Keep equipment in provided cases when transporting',
        'Charge battery-powered equipment before return',
        'Clean equipment appropriately before returning',
        'Communicate proactively with equipment office if issues arise'
      ]
    }
  ];

  const consequences = [
    { severity: 'Minor Infractions', examples: 'Late return (first time), minor unreported damage', action: 'Written warning, temporary suspension (1-2 weeks)' },
    { severity: 'Moderate Infractions', examples: 'Repeated late returns, lending to others, significant damage', action: 'Suspension of privileges (1-3 months), possible fees' },
    { severity: 'Major Infractions', examples: 'Loss of equipment, intentional damage, commercial use', action: 'Permanent revocation of privileges, replacement costs, disciplinary action' }
  ];

  return (
    <div className="container" style={{ padding: '3rem 1.25rem', position: 'relative' }}>
      {/* Animated background elements */}
      <div style={{
        position: 'fixed',
        top: '15%',
        right: '8%',
        width: '350px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 20s ease-in-out infinite',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'fixed',
        bottom: '15%',
        left: '8%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(20, 184, 166, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 18s ease-in-out infinite reverse',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 4rem', position: 'relative', zIndex: 1 }}>
        <div className="icon-wrapper icon-wrapper-primary" style={{ width: '80px', height: '80px', margin: '0 auto 1rem' }}>
          <BookOpenIcon className="icon-xl" />
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
          Usage Guidelines
        </h1>
        <p style={{ fontSize: '1.125rem', color: '#64748b', lineHeight: '1.7' }}>
          Please read and understand these guidelines before borrowing equipment. Following these rules ensures a smooth experience for everyone.
        </p>
      </div>

      {/* Guidelines Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem',
        marginBottom: '4rem',
        position: 'relative',
        zIndex: 1
      }}>
        {guidelines.map((guideline, index) => (
          <div 
            key={index}
            className="card"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              transition: 'all 0.3s ease',
              height: '100%'
            }}
          >
            <div className="icon-wrapper icon-wrapper-primary" style={{ 
              marginBottom: '1rem',
              width: '64px',
              height: '64px'
            }}>
              <guideline.IconComponent className="icon-lg" />
            </div>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '700', 
              color: '#0f172a', 
              marginBottom: '1rem' 
            }}>
              {guideline.title}
            </h3>
            <ul style={{ 
              paddingLeft: '1.25rem',
              margin: 0,
              color: '#64748b',
              lineHeight: '1.8',
              fontSize: '0.9rem'
            }}>
              {guideline.content.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '0.5rem' }}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Consequences Section */}
      <div style={{ 
        maxWidth: '1000px', 
        margin: '0 auto 4rem',
        position: 'relative',
        zIndex: 1
      }}>
        <h2 style={{ 
          fontSize: '2rem', 
          fontWeight: '700', 
          color: '#0f172a',
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          Policy Violations & Consequences
        </h2>
        <p style={{ 
          textAlign: 'center', 
          color: '#64748b', 
          marginBottom: '2rem',
          fontSize: '1rem'
        }}>
          We strive to maintain a fair system. Violations are handled on a case-by-case basis.
        </p>
        <div style={{ 
          background: '#ffffff',
          borderRadius: '1rem',
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <table className="table" style={{ marginBottom: 0 }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)', color: 'white' }}>
                <th style={{ color: 'white', fontWeight: '600' }}>Severity</th>
                <th style={{ color: 'white', fontWeight: '600' }}>Examples</th>
                <th style={{ color: 'white', fontWeight: '600' }}>Consequences</th>
              </tr>
            </thead>
            <tbody>
              {consequences.map((item, index) => (
                <tr key={index} style={{ 
                  background: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                  transition: 'background 0.2s ease'
                }}>
                  <td style={{ fontWeight: '600', color: '#0f172a' }}>{item.severity}</td>
                  <td style={{ color: '#64748b' }}>{item.examples}</td>
                  <td style={{ color: '#64748b' }}>{item.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Important Notice */}
      <div 
        className="card"
        style={{ 
          maxWidth: '900px',
          margin: '0 auto 3rem',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          border: '2px solid #fbbf24',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div className="icon-wrapper icon-wrapper-warning" style={{ flexShrink: 0 }}>
            <ZapIcon className="icon-lg" />
          </div>
          <div>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '700', 
              color: '#92400e', 
              marginBottom: '0.75rem' 
            }}>
              Important Notice
            </h3>
            <p style={{ 
              color: '#78350f', 
              lineHeight: '1.7',
              margin: 0,
              fontSize: '0.95rem'
            }}>
              By submitting an equipment request, you acknowledge that you have read, understood, and agree to comply with all usage guidelines and policies. Failure to follow these guidelines may result in suspension or permanent revocation of borrowing privileges, as well as financial liability for damage or loss.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div 
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
          <HelpCircleIcon className="icon-lg" />
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '1rem', color: 'white' }}>
          Questions about guidelines?
        </h2>
        <p style={{ fontSize: '1rem', marginBottom: '2rem', opacity: '0.95' }}>
          Check our FAQ or reach out to our support team for clarification
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link 
            to="/faq" 
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
            View FAQ
          </Link>
          <Link 
            to="/contact" 
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
            Contact Support
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(25px, -25px) scale(1.08); }
        }
      `}</style>
    </div>
  );
};

export default UsageGuidelines;
