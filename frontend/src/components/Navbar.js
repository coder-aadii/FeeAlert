import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaBars, FaUserCircle, FaCog, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import logo from '../resouces/images/logo_img.jpg';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const menuItems = [
    { label: 'Home', path: '/dashboard' },
    { label: 'Clients', path: '/clients' },
    { label: 'Reminders', path: '/reminders' },
    { label: 'Payments', path: '/payments' },
    { label: 'Settings', path: '/settings' },
  ];

  return (
    <nav className="navbar navbar-expand-lg bg-white fixed-top shadow-sm">
      <div className="container">
        {/* Logo and Brand */}
        <Link to="/dashboard" className="navbar-brand d-flex align-items-center">
          <img
            src={logo}
            alt="FeeAlert Logo"
            className="navbar-logo me-2"
            style={{ height: '40px' }}
          />
          {/* <span className="brand-text fw-bold">FeeAlert</span> */}
        </Link>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleMobileMenu}
          aria-expanded={isMobileMenuOpen}
          aria-label="Toggle navigation"
        >
          <FaBars />
        </button>

        {/* Navigation Menu */}
        <div className={`collapse navbar-collapse ${isMobileMenuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {menuItems.map((item) => (
              <li className="nav-item" key={item.path}>
                <Link 
                  to={item.path} 
                  className="nav-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Profile Dropdown */}
          <div className="nav-item dropdown">
            <button
              className="btn btn-link nav-link dropdown-toggle d-flex align-items-center"
              onClick={toggleProfileDropdown}
              style={{ textDecoration: 'none' }}
            >
              <FaUserCircle className="me-2" />
              <span>Profile</span>
              <FaChevronDown className="ms-1" />
            </button>

            <ul className={`dropdown-menu dropdown-menu-end ${isProfileDropdownOpen ? 'show' : ''}`}>
              <li>
                <Link to="/profile" className="dropdown-item">
                  <FaUserCircle className="me-2" />
                  View Profile
                </Link>
              </li>
              <li>
                <Link to="/profile/settings" className="dropdown-item">
                  <FaCog className="me-2" />
                  Account Settings
                </Link>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button onClick={handleLogout} className="dropdown-item text-danger">
                  <FaSignOutAlt className="me-2" />
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
