import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-top">
          <Link to="/" className="navbar-brand" onClick={handleNavClick}>
            SynergyFit
          </Link>

          <button
            type="button"
            className="navbar-toggle"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((v) => !v)}
          >
            <span className="navbar-toggle-icon" aria-hidden="true">
              {isMenuOpen ? '✕' : '☰'}
            </span>
          </button>
        </div>

        <ul className={`navbar-links ${isMenuOpen ? 'open' : ''}`}>
          {isAuthenticated ? (
            <>
              <li><Link to="/dashboard" onClick={handleNavClick}>Dashboard</Link></li>
              <li><Link to="/workouts" onClick={handleNavClick}>Workouts</Link></li>
              <li><Link to="/meals" onClick={handleNavClick}>Nutrition</Link></li>
              <li><Link to="/progress" onClick={handleNavClick}>Progress</Link></li>
              <li><Link to="/goals" onClick={handleNavClick}>Goals</Link></li>
              <li><Link to="/social" onClick={handleNavClick}>Social</Link></li>
              <li><Link to="/profile" onClick={handleNavClick}>Profile</Link></li>
                {user?.role === 'admin' && (
                <li><Link to="/admin" className="admin-link" onClick={handleNavClick}>🛡️ Admin</Link></li>
              )}
              <li>
                <button onClick={() => { handleNavClick(); handleLogout(); }} className="btn btn-secondary">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login" onClick={handleNavClick}>Login</Link></li>
              <li>
                <Link to="/register" className="btn btn-primary" onClick={handleNavClick}>
                  Sign Up
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
