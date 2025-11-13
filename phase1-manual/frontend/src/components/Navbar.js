import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SettingsIcon, BoxIcon, ClipboardIcon } from './Icons';

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          <div className="brand-icon">⚡</div>
          EquipShare
        </Link>

        {!user ? (
          <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/login" className="btn btn-outline">Login</Link>
            <Link to="/register" className="btn btn-primary" style={{ color: 'white', textDecoration: 'none' }}>Register</Link>
          </div>
        ) : (
          <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/equipment" title="Browse available equipment and submit requests" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <BoxIcon style={{ width: '16px', height: '16px' }} />
              Browse Equipment
            </Link>
            <Link to="/requests" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <ClipboardIcon style={{ width: '16px', height: '16px' }} />
              My Requests
            </Link>
            {(user.role === 'admin' || user.role === 'staff') && (
              <Link 
                to="/admin" 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.35rem',
                  position: 'relative'
                }}
                title="Manage equipment inventory (Admin/Staff only)"
              >
                <SettingsIcon style={{ width: '16px', height: '16px' }} />
                Manage Equipment
                <span style={{
                  fontSize: '0.625rem',
                  fontWeight: '700',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '0.25rem',
                  backgroundColor: '#fef3c7',
                  color: '#92400e',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginLeft: '0.125rem'
                }}>
                  {user.role === 'admin' ? 'Admin' : 'Staff'}
                </span>
              </Link>
            )}
            <span style={{ opacity: 0.9, fontSize: '0.875rem', marginLeft: '0.25rem' }}>
              {user.name} ({user.role})
            </span>
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
