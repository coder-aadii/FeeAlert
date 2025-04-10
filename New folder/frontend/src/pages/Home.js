import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaSms, FaUsers, FaClock, FaTimes } from 'react-icons/fa';
import EmailReminderForm from '../components/EmailReminderForm';
import SMSReminderForm from '../components/SMSReminderForm';
import Navbar from '../components/Navbar';

const Home = () => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showSMSForm, setShowSMSForm] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalClients: 0,
    emailsSent: 0,
    smsSent: 0,
    pendingReminders: 0
  });

  useEffect(() => {
    // Animate numbers on load
    const finalStats = {
      totalClients: 150,
      emailsSent: 1234,
      smsSent: 890,
      pendingReminders: 25
    };

    setDashboardStats(finalStats);
  }, []);

  // Close modal when clicking outside
  const handleModalClick = (e, closeFunction) => {
    if (e.target === e.currentTarget) {
      closeFunction(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">
          Welcome to Your Dashboard
        </h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              icon: <FaUsers className="text-blue-500 text-3xl" />,
              label: "Total Clients",
              value: dashboardStats.totalClients,
              color: "blue"
            },
            {
              icon: <FaEnvelope className="text-green-500 text-3xl" />,
              label: "Emails Sent",
              value: dashboardStats.emailsSent,
              color: "green"
            },
            {
              icon: <FaSms className="text-purple-500 text-3xl" />,
              label: "SMS Sent",
              value: dashboardStats.smsSent,
              color: "purple"
            },
            {
              icon: <FaClock className="text-orange-500 text-3xl" />,
              label: "Pending Reminders",
              value: dashboardStats.pendingReminders,
              color: "orange"
            }
          ].map((stat, index) => (
            <div 
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 bg-${stat.color}-50 rounded-lg`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {stat.value.toLocaleString()}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions and Recent Activity */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-6">
              <button
                onClick={() => setShowEmailForm(true)}
                className="flex flex-col items-center justify-center p-6 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors duration-300 group"
              >
                <FaEnvelope className="text-3xl text-blue-500 mb-3 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-blue-700 font-medium">Send Email Reminder</span>
              </button>
              <button
                onClick={() => setShowSMSForm(true)}
                className="flex flex-col items-center justify-center p-6 rounded-xl bg-green-50 hover:bg-green-100 transition-colors duration-300 group"
              >
                <FaSms className="text-3xl text-green-500 mb-3 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-green-700 font-medium">Send SMS Reminder</span>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Recent Activity</h2>
            <div className="space-y-4">
              {[
                {
                  icon: <FaEnvelope className="text-blue-500" />,
                  message: "Email reminder sent to John Doe",
                  time: "2m ago"
                },
                {
                  icon: <FaSms className="text-green-500" />,
                  message: "SMS reminder sent to Jane Smith",
                  time: "1h ago"
                }
              ].map((activity, index) => (
                <div 
                  key={index}
                  className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="p-2 rounded-full bg-gray-50 mr-3">
                    {activity.icon}
                  </div>
                  <p className="text-gray-700 flex-grow">{activity.message}</p>
                  <span className="text-sm text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Components */}
        {showEmailForm && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm"
            onClick={(e) => handleModalClick(e, setShowEmailForm)}
          >
            <div className="bg-white p-8 rounded-xl w-full max-w-md shadow-xl transform transition-all">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Send Email Reminder</h2>
                <button 
                  onClick={() => setShowEmailForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <FaTimes className="text-gray-500" />
                </button>
              </div>
              <EmailReminderForm />
            </div>
          </div>
        )}

        {showSMSForm && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm"
            onClick={(e) => handleModalClick(e, setShowSMSForm)}
          >
            <div className="bg-white p-8 rounded-xl w-full max-w-md shadow-xl transform transition-all">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Send SMS Reminder</h2>
                <button 
                  onClick={() => setShowSMSForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <FaTimes className="text-gray-500" />
                </button>
              </div>
              <SMSReminderForm />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
