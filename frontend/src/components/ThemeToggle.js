import React from 'react';
import './ThemeToggle.css';

const ThemeToggle = ({ toggleTheme, isDarkMode }) => {
  return (
    <div className="theme-toggle">
      <label className="switch">
        <input type="checkbox" checked={isDarkMode} onChange={toggleTheme} />
        <span className="slider round"></span>
      </label>
      <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
    </div>
  );
};

export default ThemeToggle;