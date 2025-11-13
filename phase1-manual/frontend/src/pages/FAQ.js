import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { RocketIcon, PackageIcon, ClipboardIcon, RefreshIcon, ShieldCheckIcon, HelpCircleIcon, MessageCircleIcon } from '../components/Icons';

const FAQ = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqCategories = [
    {
      category: 'Getting Started',
      IconComponent: RocketIcon,
      questions: [
        {
          id: 1,
          question: "How do I create an account?",
          answer: "Click on the 'Register' button in the top navigation or on the home page. Fill in your details including name, email, password, and select your role (Student, Staff, or Admin). Once registered, you'll be automatically logged in and can start browsing equipment."
        },
        {
          id: 2,
          question: "Who can use EquipShare?",
          answer: "EquipShare is designed for educational institutions. Students, faculty members, and administrative staff can all create accounts and use the platform to borrow equipment. Different roles have different permissions - admins and staff can manage equipment and approve requests."
        },
        {
          id: 3,
          question: "Is there a mobile app?",
          answer: "Currently, EquipShare is a web-based platform that works seamlessly on all devices including smartphones, tablets, and computers. Simply access it through your web browser for the full experience."
        }
      ]
    },
    {
      category: 'Borrowing Equipment',
      IconComponent: PackageIcon,
      questions: [
        {
          id: 4,
          question: "How do I request equipment?",
          answer: "Browse the available equipment, select the item you need, and click on 'New Request'. Fill in the details including the dates you need the equipment and submit. You'll receive a notification once your request is reviewed by staff or admin."
        },
        {
          id: 5,
          question: "How long can I borrow equipment?",
          answer: "Equipment borrowing periods vary by item type. Typically, you can borrow equipment for up to 14 days. Check with your institution's policy for specific items. You can also request extensions if needed."
        },
        {
          id: 6,
          question: "Can I borrow multiple items at once?",
          answer: "Yes! You can submit multiple requests for different equipment items. Each item will have its own request that needs to be approved separately. Please ensure you can responsibly manage all borrowed items."
        },
        {
          id: 7,
          question: "What if the equipment I need is unavailable?",
          answer: "If equipment shows 0 availability, you can check back later when it becomes available. You can also contact support to inquire about when the item might be returned or to request similar alternatives."
        }
      ]
    },
    {
      category: 'Requests & Tracking',
      IconComponent: ClipboardIcon,
      questions: [
        {
          id: 8,
          question: "How do I track my requests?",
          answer: "Navigate to 'My Requests' from the main menu to see all your current and past requests. Each request shows its status (Pending, Approved, Rejected, or Returned), the equipment details, and relevant dates."
        },
        {
          id: 9,
          question: "Can I cancel a request?",
          answer: "You can cancel a request that is still in 'Pending' status. Once approved, please contact support or the admin to discuss cancellation. Try to cancel as early as possible to free up equipment for others."
        },
        {
          id: 10,
          question: "Can I extend my borrowing period?",
          answer: "Yes! Submit an extension request through your active requests page at least 2 days before your return date. Extensions are subject to availability and approval. Make sure no one else has requested the same equipment."
        },
        {
          id: 11,
          question: "What happens if my request is rejected?",
          answer: "If your request is rejected, you'll receive a notification with the reason. Common reasons include unavailability, incomplete information, or policy violations. You can submit a new request or contact support for clarification."
        }
      ]
    },
    {
      category: 'Returns & Issues',
      IconComponent: RefreshIcon,
      questions: [
        {
          id: 12,
          question: "How do I return equipment?",
          answer: "Return equipment to the designated equipment office or location specified by your institution. Ensure the equipment is in good condition and returned on time. Mark your request as 'Returned' in the system once you've physically returned it."
        },
        {
          id: 13,
          question: "What happens if I return equipment late?",
          answer: "Late returns may affect your future borrowing privileges. Please contact support immediately if you need an extension. We understand emergencies happen - communication is key!"
        },
        {
          id: 14,
          question: "What if equipment is damaged?",
          answer: "Report any damage immediately through the support system. We understand accidents happen. Do not attempt to repair equipment yourself. Be honest about damage - it helps us maintain the equipment better for everyone."
        },
        {
          id: 15,
          question: "What if equipment was already damaged when I received it?",
          answer: "Report any pre-existing damage immediately upon receiving the equipment, ideally with photos. This protects you from being held responsible. You can also reject damaged equipment and request a replacement."
        }
      ]
    },
    {
      category: 'Account & Security',
      IconComponent: ShieldCheckIcon,
      questions: [
        {
          id: 16,
          question: "How do I change my password?",
          answer: "Navigate to your account settings and select 'Change Password'. You'll need to enter your current password and then your new password twice. Make sure to use a strong password for security."
        },
        {
          id: 17,
          question: "I forgot my password. What should I do?",
          answer: "Click on 'Forgot Password' on the login page. Enter your registered email address and you'll receive instructions to reset your password. Check your spam folder if you don't see the email within a few minutes."
        },
        {
          id: 18,
          question: "Can I update my account information?",
          answer: "Yes, you can update your name and contact information in your account settings. However, your email address (username) and role cannot be changed without admin assistance for security reasons."
        },
        {
          id: 19,
          question: "Is my data secure?",
          answer: "Yes! We take data security seriously. All passwords are encrypted, and we follow industry best practices for data protection. We only collect information necessary for equipment lending and never share your personal data with third parties."
        }
      ]
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

      <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 4rem', position: 'relative', zIndex: 1 }}>
        <div className="icon-wrapper icon-wrapper-primary" style={{ width: '80px', height: '80px', margin: '0 auto 1rem' }}>
          <HelpCircleIcon className="icon-xl" />
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
          Frequently Asked Questions
        </h1>
        <p style={{ fontSize: '1.125rem', color: '#64748b', lineHeight: '1.7' }}>
          Find answers to common questions about using EquipShare. Can't find what you're looking for? <Link to="/contact" style={{ color: '#0ea5e9', fontWeight: '600', textDecoration: 'none' }}>Contact us</Link>
        </p>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {faqCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} style={{ marginBottom: '3rem' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              marginBottom: '1.5rem',
              paddingBottom: '0.75rem',
              borderBottom: '2px solid #e5e7eb'
            }}>
              <div className="icon-wrapper icon-wrapper-primary">
                <category.IconComponent className="icon-lg" />
              </div>
              <h2 style={{ 
                fontSize: '1.75rem', 
                fontWeight: '700', 
                color: '#0f172a',
                margin: 0
              }}>
                {category.category}
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {category.questions.map((faq) => (
                <div 
                  key={faq.id}
                  style={{
                    background: '#ffffff',
                    border: expandedFaq === faq.id ? '2px solid #0ea5e9' : '1px solid #e5e7eb',
                    borderRadius: '1rem',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    boxShadow: expandedFaq === faq.id ? '0 4px 12px rgba(14, 165, 233, 0.1)' : '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                    style={{
                      width: '100%',
                      padding: '1.25rem 1.5rem',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: expandedFaq === faq.id ? '#0ea5e9' : '#0f172a',
                      transition: 'color 0.2s ease'
                    }}
                  >
                    <span>{faq.question}</span>
                    <span style={{ 
                      fontSize: '1.5rem', 
                      transform: expandedFaq === faq.id ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease',
                      color: '#0ea5e9'
                    }}>
                      ⌄
                    </span>
                  </button>
                  {expandedFaq === faq.id && (
                    <div style={{ 
                      padding: '0 1.5rem 1.25rem', 
                      color: '#64748b', 
                      lineHeight: '1.7',
                      fontSize: '0.95rem',
                      animation: 'fadeIn 0.3s ease'
                    }}>
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Still need help section */}
      <div 
        className="card"
        style={{ 
          textAlign: 'center', 
          maxWidth: '700px', 
          margin: '4rem auto 0',
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
          Still have questions?
        </h2>
        <p style={{ fontSize: '1rem', marginBottom: '2rem', opacity: '0.95' }}>
          Our support team is ready to help you with any questions or concerns
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
          <Link 
            to="/help" 
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
            Browse Help Center
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default FAQ;
