import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { SettingsIcon, BoxIcon, ClipboardIcon } from './Icons';

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();
  const brandTo = user ? '/home' : '/';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
<Link to={brandTo} className="brand" aria-label="EquipShare Home">
          <div className="brand-icon" aria-hidden>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          EquipShare
        </Link>

        {!user ? (
          <div className="nav-links">
            <Link to="/login" className="btn btn-outline">Login</Link>
            <Link to="/register" className="btn btn-primary">Register</Link>
          </div>
        ) : (
          <div className="nav-links">
            <NavLink to="/equipment" title="Browse available equipment and submit requests" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <BoxIcon style={{ width: '16px', height: '16px' }} />
              Browse Equipment
            </NavLink>
            <NavLink to="/requests" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <ClipboardIcon style={{ width: '16px', height: '16px' }} />
              My Requests
            </NavLink>
            {(user.role === 'admin' || user.role === 'staff') && (
              <>
                <NavLink 
                  to="/admin" 
                  title="Manage equipment inventory (Admin/Staff only)"
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                >
                  <SettingsIcon style={{ width: '16px', height: '16px' }} />
                  Manage Equipment
                  <span className="role-badge">
                    {user.role === 'admin' ? 'Admin' : 'Staff'}
                  </span>
                </NavLink>
                <NavLink to="/admin/overdues" title="Overdue returns" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Overdues
                </NavLink>
                <NavLink to="/admin/analytics" title="Analytics" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="20" x2="12" y2="10"/>
                    <line x1="18" y1="20" x2="18" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="16"/>
                  </svg>
                  Analytics
                </NavLink>
              </>
            )}
            <span className="user-meta">
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
