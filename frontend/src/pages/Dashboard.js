import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [admin, setAdmin] = useState({});
  
  useEffect(() => {
    // Get admin data from localStorage on component mount
    const adminData = JSON.parse(localStorage.getItem('admin') || '{}');
    setAdmin(adminData);
  }, []);

  return (
    <div className="dashboard-container">
      <h1>Welcome, {admin.username || 'User'}!</h1>
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Pending Payments</h3>
          <p className="stat-number">5</p>
        </div>
        <div className="stat-card">
          <h3>Upcoming Reminders</h3>
          <p className="stat-number">3</p>
        </div>
        <div className="stat-card">
          <h3>Total Students</h3>
          <p className="stat-number">120</p>
        </div>
      </div>
      <div className="dashboard-content">
        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <ul>
            <li>Payment received from John Doe</li>
            <li>New student registration: Jane Smith</li>
            <li>Fee reminder sent to 15 students</li>
          </ul>
        </div>
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <button>Add New Student</button>
          <button>Record Payment</button>
          <button>Send Reminders</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
