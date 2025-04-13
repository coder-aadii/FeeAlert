import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState({});
  const [stats, setStats] = useState({
    pendingPayments: 0,
    upcomingReminders: 0,
    totalStudents: 0,
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

  useEffect(() => {
    const adminData = JSON.parse(localStorage.getItem('admin') || '{}');
    setAdmin(adminData);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch students data from MongoDB
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const students = response.data;
      
      // Calculate real statistics
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const currentDay = now.getDate();

      // Calculate pending payments
      const pendingPayments = students.filter(student => 
        !student.lastPaymentDate || 
        new Date(student.lastPaymentDate).getMonth() !== currentMonth
      ).length;

      // Calculate total paid this month
      const paidThisMonth = students.filter(student => {
        if (!student.lastPaymentDate) return false;
        const paymentDate = new Date(student.lastPaymentDate);
        return paymentDate.getMonth() === currentMonth && 
               paymentDate.getFullYear() === currentYear;
      }).length;

      // Calculate slot statistics
      const slots = {
        slot1: { total: 0, pending: 0 },
        slot2: { total: 0, pending: 0 },
        slot3: { total: 0, pending: 0 }
      };

      students.forEach(student => {
        const dueDate = new Date(student.feeDueDate).getDate();
        let slot;
        
        if (dueDate >= 1 && dueDate <= 10) slot = 'slot1';
        else if (dueDate >= 11 && dueDate <= 20) slot = 'slot2';
        else slot = 'slot3';

        slots[slot].total++;
        if (!student.lastPaymentDate || 
            new Date(student.lastPaymentDate).getMonth() !== currentMonth) {
          slots[slot].pending++;
        }
      });

      // Calculate upcoming reminders based on current date
      const upcomingReminders = students.filter(student => {
        const dueDate = new Date(student.feeDueDate).getDate();
        
        // Check if student needs a reminder based on payment slots
        if (currentDay <= 5 && dueDate <= 10) return true;
        if (currentDay <= 15 && dueDate >= 11 && dueDate <= 20) return true;
        if (currentDay <= 25 && dueDate >= 21) return true;
        
        return false;
      }).length;

      // Update states with real data
      setStats({
        pendingPayments,
        upcomingReminders,
        totalStudents: students.length,
        totalPaidThisMonth: paidThisMonth
      });
      
      setSlotStats(slots);

      // Create recent activity from student data
      const activities = [];
      
      // Add payment activities
      const paymentActivities = students
        .filter(student => student.lastPaymentDate)
        .sort((a, b) => new Date(b.lastPaymentDate) - new Date(a.lastPaymentDate))
        .slice(0, 3)
        .map(student => ({
          type: 'payment',
          timestamp: new Date(student.lastPaymentDate),
          description: `Payment received from ${student.name}`
        }));
      
      activities.push(...paymentActivities);
      
      // Add any recent registrations
      const recentRegistrations = students
        .filter(student => student.registrationDate)
        .sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate))
        .slice(0, 2)
        .map(student => ({
          type: 'registration',
          timestamp: new Date(student.registrationDate),
          description: `New student registration: ${student.name}`
        }));
        
      activities.push(...recentRegistrations);
      
      // Sort all activities by timestamp
      activities.sort((a, b) => b.timestamp - a.timestamp);
      
      setRecentActivity(activities);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    switch(action) {
      case 'addStudent':
        navigate('/students/add');
        break;
      case 'recordPayment':
        navigate('/payments/record');
        break;
      case 'sendReminders':
        navigate('/send-reminder');
        break;
      case 'viewStudents':
        navigate('/students');
        break;
      default:
        break;
    }
  };

  if (loading) return <div className="dashboard-loading">Loading dashboard...</div>;
  if (error) return <div className="dashboard-error">{error}</div>;

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
          <h3>Total Students</h3>
          <p className="stat-number">{stats.totalStudents}</p>
          <p className="stat-description">Active students</p>
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
                      {new Date(activity.timestamp).toLocaleTimeString()}
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
            <button onClick={() => handleQuickAction('addStudent')}>
              Add New Student
            </button>
            <button onClick={() => handleQuickAction('recordPayment')}>
              Record Payment
            </button>
            <button onClick={() => handleQuickAction('sendReminders')}>
              Send Reminders
            </button>
            <button onClick={() => handleQuickAction('viewStudents')}>
              View All Students
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
