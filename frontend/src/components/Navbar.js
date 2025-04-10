import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Loader from './Loader';
import ThemeToggle from './ThemeToggle';
import './Navbar.css';

const logo = 'https://res.cloudinary.com/deoegf9on/image/upload/v1743336576/logo_img_u6ueop.png';
const defaultUserImg = 'https://res.cloudinary.com/deoegf9on/image/upload/v1743336193/defaultUserImage_zinyrv.avif'

const Navbar = ({ toggleTheme, isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.navbar-container')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  const handleLogout = () => {
    try {
      setIsLoading(true); // Show loader
      
      // Clear all authentication-related data
      localStorage.clear(); // This will remove all items from localStorage
      
      // Close the dropdown
      setIsDropdownOpen(false);
      
      // Small delay to show the loader
      setTimeout(() => {
        window.location.href = '/login';
      }, 500);
    } catch (error) {
      console.error('Logout error:', error);
      // If something goes wrong, still try to redirect
      setIsLoading(false);
      window.location.href = '/login';
    }
  };

  // Get username from localStorage or use default
  const username = JSON.parse(localStorage.getItem('admin'))?.username || 'User';

  return (
    <>
      {isLoading && <Loader />}
      <nav className="navbar">
      <div className="navbar-container">
        {/* Logo/Brand */}
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <img
            src={logo}
            alt="FeeAlert Logo"
            className="navbar-logo me-2"
            style={{ height: '40px' }}
          />
          {/* <span className="brand-text fw-bold">FeeAlert</span> */}
        </Link>

        {/* Hamburger Menu Button */}
        <button
          className={`hamburger ${isOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Links */}
        <div className={`nav-links ${isOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setIsOpen(false)}>
            Home
          </Link>
          <Link to="/send-reminder" className="nav-link" onClick={() => setIsOpen(false)}>
            Send Reminder
          </Link>
          <Link to="/clients" className="nav-link" onClick={() => setIsOpen(false)}>
            Clients
          </Link>
          <Link to="/dashboard" className="nav-link" onClick={() => setIsOpen(false)}>
            Dashboard
          </Link>
          <Link to="/history" className="nav-link" onClick={() => setIsOpen(false)}>
            History
          </Link>
          
          {/* Right-aligned items container */}
          <div className="nav-right-items">
            {/* Theme Toggle */}
            <div className="theme-toggle-container">
              <ThemeToggle toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
            </div>

            {/* User Profile Section */}
            <div className="user-profile" ref={dropdownRef}>
            <div className="profile-trigger" onClick={toggleDropdown}>
              <img
                src={defaultUserImg}
                alt="User"
                className="user-avatar"
              />
              <span className="username">{username}</span>
              <i className={`fas fa-chevron-down ${isDropdownOpen ? 'rotate' : ''}`}></i>
            </div>
            
            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="profile-dropdown">
                <Link to="/settings" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                  <i className="fas fa-cog"></i> Settings
                </Link>
                <button className="dropdown-item" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i> Logout
                </button>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </nav>
    </>
  );
};

export default Navbar;
