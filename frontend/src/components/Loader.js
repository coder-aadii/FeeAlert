import React from 'react';
import './Loader.css';

const Loader = ({ size = 'medium', color = 'primary' }) => {
  return (
    <div className="loader-container">
      <div className={`loader loader-${size} loader-${color}`}></div>
    </div>
  );
};

export default Loader;
