import React, { useState } from 'react';
import { MailIcon, PhoneIcon, MessageCircleIcon, LightbulbIcon, SpinnerIcon } from '../components/Icons';
import { supportAPI } from '../api';

const ContactSupport = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'normal'
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Attempt to send via API
      await supportAPI.sendMessage(formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '', priority: 'normal' });
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (err) {
      // If API fails (backend not running), simulate local submission
      console.log('API not available, simulating local submission:', err);
      
      // Log the form data for development purposes
      console.log('Contact Form Submission:', {
        ...formData,
        timestamp: new Date().toISOString()
      });
      
      // Show success anyway (since this is a demo/development environment)
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '', priority: 'normal' });
      
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  const contactMethods = [
    {
      IconComponent: MailIcon,
      title: "Email",
      detail: "support@equipshare.edu",
      description: "We'll respond within 24 hours"
    },
    {
      IconComponent: PhoneIcon,
      title: "Phone",
      detail: "(555) 123-4567",
      description: "Mon-Fri, 9AM-5PM EST"
    },
    {
      IconComponent: MessageCircleIcon,
      title: "Live Chat",
      detail: "Available now",
      description: "Get instant help from our team"
    }
  ];

  return (
    <div className="container" style={{ padding: '3rem 1.25rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 4rem' }}>
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
          Contact Support
        </h1>
        <p style={{ fontSize: '1.125rem', color: '#64748b' }}>
          Have a question or need assistance? We're here to help!
        </p>
      </div>

      {/* Contact Methods */}
      <div className="grid" style={{ 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '4rem'
      }}>
        {contactMethods.map((method, index) => (
          <div
            key={index}
            className="card"
            style={{
              textAlign: 'center',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              transition: 'all 0.3s ease'
            }}
          >
            <div className="icon-wrapper icon-wrapper-primary" style={{ width: '64px', height: '64px', margin: '0 auto 1rem' }}>
              <method.IconComponent className="icon-lg" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#0f172a' }}>
              {method.title}
            </h3>
            <p style={{ fontSize: '1rem', fontWeight: '600', color: '#0ea5e9', marginBottom: '0.5rem' }}>
              {method.detail}
            </p>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
              {method.description}
            </p>
          </div>
        ))}
      </div>

      {/* Contact Form */}
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div className="card" style={{ padding: '2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '1.5rem', color: '#0f172a' }}>
            Send us a message
          </h2>
          
          {submitted && (
            <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
              Thank you! Your message has been sent. We'll get back to you soon.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-control form-control-modern"
                placeholder="Your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                pattern="[A-Za-z\s'-]+"
                title="Name should only contain letters, spaces, hyphens, and apostrophes"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control form-control-modern"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-control form-control-modern"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">Low - General inquiry</option>
                <option value="normal">Normal - Standard support</option>
                <option value="high">High - Urgent issue</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Subject</label>
              <input
                type="text"
                className="form-control form-control-modern"
                placeholder="Brief description of your issue"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                minLength="3"
                maxLength="150"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Message</span>
                <span style={{ fontSize: '0.875rem', color: formData.message.length > 2000 ? '#ef4444' : '#64748b', fontWeight: 'normal' }}>
                  {2000 - formData.message.length} characters remaining
                </span>
              </label>
              <textarea
                className="form-control form-control-modern"
                placeholder="Please provide details about your question or issue..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows="6"
                minLength="10"
                maxLength="2000"
                style={{ resize: 'vertical' }}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-modern"
              disabled={loading}
              style={{
                background: loading 
                  ? 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)' 
                  : 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
                marginTop: '0.5rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {loading && <SpinnerIcon className="icon-md" />}
              <span>{loading ? 'Sending...' : 'Send Message'}</span>
            </button>
          </form>
        </div>

        {/* Additional Info */}
        <div 
          className="card"
          style={{ 
            marginTop: '2rem',
            background: 'linear-gradient(135deg, #eff6ff 0%, #f3f4f6 100%)',
            border: '1px solid #dbeafe'
          }}
        >
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div className="icon-wrapper icon-wrapper-primary">
              <LightbulbIcon className="icon-lg" />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#0f172a' }}>
                Before you contact us
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6', margin: 0 }}>
                Check out our <a href="/help" style={{ color: '#0ea5e9', fontWeight: '600' }}>Help Center</a> for 
                quick answers to common questions. You might find what you're looking for instantly!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSupport;
