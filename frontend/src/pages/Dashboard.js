import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState({});
  const [stats, setStats] = useState({
    pendingPayments: 0,
    upcomingReminders: 0,
    totalClients: 0,
    totalPaidThisMonth: 0
  });
  const [slotStats, setSlotStats] = useState({
    slot1: { total: 0, pending: 0 },
    slot2: { total: 0, pending: 0 },
    slot3: { total: 0, pending: 0 }
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create axios instance with auth header
  const getAuthAxios = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token missing');
    }
    return axios.create({
      baseURL: process.env.REACT_APP_BACKEND_URL,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); // Reset error state
      
      const authAxios = getAuthAxios();
      
      // Fetch clients data from MongoDB
      const response = await authAxios.get('/api/clients');
      
      // Handle different response structures
      let clients = [];
      if (response.data && Array.isArray(response.data)) {
        clients = response.data;
      } else if (response.data && Array.isArray(response.data.clients)) {
        clients = response.data.clients;
      } else {
        console.error('Unexpected API response format:', response.data);
        setError('Received unexpected data format from server');
        setLoading(false);
        return;
      }
      
      // Log the first client to debug data structure
      if (clients.length > 0) {
        console.log('Sample client data:', clients[0]);
      }
      
      // Calculate real statistics
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const currentDay = now.getDate();

      // Calculate pending payments with null checks
      const pendingPayments = clients.filter(client => {
        if (!client) return false;
        return !client.lastPaymentDate || 
          new Date(client.lastPaymentDate).getMonth() !== currentMonth;
      }).length;

      // Calculate total paid this month with null checks
      const paidThisMonth = clients.filter(client => {
        if (!client || !client.lastPaymentDate) return false;
        try {
          const paymentDate = new Date(client.lastPaymentDate);
          return paymentDate.getMonth() === currentMonth && 
                 paymentDate.getFullYear() === currentYear;
        } catch (err) {
          console.error('Invalid date format for lastPaymentDate:', client.lastPaymentDate);
          return false;
        }
      }).length;

      // Calculate slot statistics with null checks
      const slots = {
        slot1: { total: 0, pending: 0 },
        slot2: { total: 0, pending: 0 },
        slot3: { total: 0, pending: 0 }
      };

      clients.forEach(client => {
        if (!client || !client.feeDueDate) return;
        
        try {
          const dueDate = new Date(client.feeDueDate).getDate();
          let slot;
          
          if (dueDate >= 1 && dueDate <= 10) slot = 'slot1';
          else if (dueDate >= 11 && dueDate <= 20) slot = 'slot2';
          else slot = 'slot3';

          slots[slot].total++;
          if (!client.lastPaymentDate || 
              new Date(client.lastPaymentDate).getMonth() !== currentMonth) {
            slots[slot].pending++;
          }
        } catch (err) {
          console.error('Invalid date format for feeDueDate:', client.feeDueDate);
        }
      });

      // Calculate upcoming reminders based on current date with null checks
      const upcomingReminders = clients.filter(client => {
        if (!client || !client.feeDueDate) return false;
        
        try {
          const dueDate = new Date(client.feeDueDate).getDate();
          
          // Check if client needs a reminder based on payment slots
          if (currentDay <= 5 && dueDate <= 10) return true;
          if (currentDay <= 15 && dueDate >= 11 && dueDate <= 20) return true;
          if (currentDay <= 25 && dueDate >= 21) return true;
          
          return false;
        } catch (err) {
          console.error('Invalid date format for feeDueDate:', client.feeDueDate);
          return false;
        }
      }).length;

      // Update states with real data
      setStats({
        pendingPayments,
        upcomingReminders,
        totalClients: clients.length,
        totalPaidThisMonth: paidThisMonth
      });
      
      setSlotStats(slots);

      // Create recent activity from client data
      const activities = [];
      
      // Add payment activities with null checks
      const paymentActivities = clients
        .filter(client => client && client.lastPaymentDate)
        .map(client => {
          try {
            return {
              client,
              date: new Date(client.lastPaymentDate)
            };
          } catch (err) {
            console.error('Invalid date format for lastPaymentDate:', client.lastPaymentDate);
            return null;
          }
        })
        .filter(item => item !== null)
        .sort((a, b) => b.date - a.date)
        .slice(0, 3)
        .map(item => ({
          type: 'payment',
          timestamp: item.date,
          description: `Payment received from ${item.client.name || 'Unknown'}`
        }));
      
      activities.push(...paymentActivities);
      
      // Add any recent registrations with null checks
      const recentRegistrations = clients
        .filter(client => client && client.registrationDate)
        .map(client => {
          try {
            return {
              client,
              date: new Date(client.registrationDate)
            };
          } catch (err) {
            console.error('Invalid date format for registrationDate:', client.registrationDate);
            return null;
          }
        })
        .filter(item => item !== null)
        .sort((a, b) => b.date - a.date)
        .slice(0, 2)
        .map(item => ({
          type: 'registration',
          timestamp: item.date,
          description: `New client registration: ${item.client.name || 'Unknown'}`
        }));
        
      activities.push(...recentRegistrations);
      
      // Sort all activities by timestamp
      activities.sort((a, b) => b.timestamp - a.timestamp);
      
      setRecentActivity(activities);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      
      // Provide more specific error messages
      if (err.message === 'Authentication token missing') {
        setError('Your session has expired. Please log in again.');
        // Could redirect to login page here
      } else if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (err.response.status === 401) {
          setError('Your session has expired. Please log in again.');
          localStorage.removeItem('token'); // Clear invalid token
          // Could redirect to login page here
        } else {
          setError(`Server error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`);
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError('Network error. Please check your connection and try again.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(`Error: ${err.message}`);
      }
      
      setLoading(false);
    }
  }, [getAuthAxios]);

  useEffect(() => {
    const adminData = JSON.parse(localStorage.getItem('admin') || '{}');
    setAdmin(adminData);
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleQuickAction = useCallback((action) => {
    switch(action) {
      case 'addClient':
        navigate('/clients/add');
        break;
      case 'recordPayment':
        navigate('/payments/record');
        break;
      case 'sendReminders':
        navigate('/send-reminder');
        break;
      case 'viewClients':
        navigate('/clients');
        break;
      default:
        break;
    }
  }, [navigate]);

  if (loading) return <div className="dashboard-loading">Loading dashboard...</div>;
  
  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Error Loading Dashboard</h2>
        <p>{error}</p>
        <button 
          onClick={fetchDashboardData} 
          className="retry-button"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {admin.username || 'User'}!</h1>
        <p className="date-display">{new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card pending">
          <h3>Pending Payments</h3>
          <p className="stat-number">{stats.pendingPayments}</p>
          <p className="stat-description">Awaiting payment</p>
        </div>
        <div className="stat-card upcoming">
          <h3>Upcoming Reminders</h3>
          <p className="stat-number">{stats.upcomingReminders}</p>
          <p className="stat-description">Next 5 days</p>
        </div>
        <div className="stat-card total">
          <h3>Total Clients</h3>
          <p className="stat-number">{stats.totalClients}</p>
          <p className="stat-description">Active clients</p>
        </div>
        <div className="stat-card paid">
          <h3>Paid This Month</h3>
          <p className="stat-number">{stats.totalPaidThisMonth}</p>
          <p className="stat-description">Successfully collected</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="slot-statistics">
          <h2>Payment Slot Overview</h2>
          <div className="slot-cards">
            {Object.entries(slotStats).map(([slot, data]) => (
              <div key={slot} className="slot-card">
                <h3>{slot === 'slot1' ? '1st - 10th' : 
                     slot === 'slot2' ? '11th - 20th' : '21st - 31st'}</h3>
                <div className="slot-stats">
                  <p>Total: {data.total}</p>
                  <p>Pending: {data.pending}</p>
                  <p>Paid: {data.total - data.pending}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-lower">
          <div className="recent-activity">
            <h2>Recent Activity</h2>
            {recentActivity.length > 0 ? (
              <ul>
                {recentActivity.map((activity, index) => (
                  <li key={index} className={`activity-item ${activity.type}`}>
                    <span className="activity-time">
                      {activity.timestamp.toLocaleTimeString()}
                    </span>
                    <span className="activity-description">
                      {activity.description}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-activity">No recent activity</p>
            )}
          </div>

          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <button onClick={() => handleQuickAction('addClient')}>
              Add New Client
            </button>
            <button onClick={() => handleQuickAction('recordPayment')}>
              Record Payment
            </button>
            <button onClick={() => handleQuickAction('sendReminders')}>
              Send Reminders
            </button>
            <button onClick={() => handleQuickAction('viewClients')}>
              View All Clients
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;