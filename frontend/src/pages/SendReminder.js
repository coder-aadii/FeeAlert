import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './SendReminder.css';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// Move feeSlots outside the component since it's static
const feeSlots = {
  slot1: { pay: '1st - 5th', due: '1st - 10th' },
  slot2: { pay: '15th - 20th', due: '11th - 20th' },
  slot3: { pay: '25th - 30th', due: '21st - 31st' }
};

// Status colors for consistent styling
const STATUS_COLORS = {
  pending: '#f0ad4e',  // amber
  paid: '#5cb85c',     // green
  overdue: '#d9534f'   // red
};

// Add this component for status summary
const StatusSummary = ({ clients }) => {
  const summary = clients.reduce((acc, client) => {
    const status = client.paymentStatus || 'pending';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // Prepare data for pie chart
  const chartData = [
    { name: 'Pending', value: summary.pending || 0, color: STATUS_COLORS.pending },
    { name: 'Paid', value: summary.paid || 0, color: STATUS_COLORS.paid },
    { name: 'Overdue', value: summary.overdue || 0, color: STATUS_COLORS.overdue }
  ];

  return (
    <div className="status-summary-container">
      <h3>Payment Status Overview</h3>
      <div className="status-summary">
        <div className="status-counters">
          <div className="status-item" style={{ borderColor: STATUS_COLORS.pending }}>
            <span className="status-label">Pending</span>
            <span className="status-count">{summary.pending || 0}</span>
          </div>
          <div className="status-item" style={{ borderColor: STATUS_COLORS.paid }}>
            <span className="status-label">Paid</span>
            <span className="status-count">{summary.paid || 0}</span>
          </div>
          <div className="status-item" style={{ borderColor: STATUS_COLORS.overdue }}>
            <span className="status-label">Overdue</span>
            <span className="status-count">{summary.overdue || 0}</span>
          </div>
        </div>
        
        <div className="status-chart">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} clients`, 'Count']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const SendReminder = () => {
  // State variables
  const [formData, setFormData] = useState({
    dueDate: new Date(), // Initialize with current date
    message: '',
    paymentSlot: '' // New state for payment slot
  });
  
  // Enhanced search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOptions, setFilterOptions] = useState({
    status: 'all', // all, pending, paid, overdue
    slot: 'all'    // all, slot1, slot2, slot3
  });
  
  // Store all clients and filtered clients separately
  const [allClients, setAllClients] = useState([]);
  
  // New states for automated reminders
  const [automatedStatus, setAutomatedStatus] = useState({
    enabled: true,
    nextRun: new Date(new Date().setDate(new Date().getDate() + 1)) // Next day at 10:00 AM
  });
  const [reminderHistory, setReminderHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Add a notification system
  const [notification, setNotification] = useState({
    show: false,
    type: '', // 'success', 'error', 'warning', 'info'
    message: ''
  });

  // Function to determine payment slot based on due date
  const determinePaymentSlot = React.useCallback((date) => {
    const day = date.getDate();
    
    if (day >= 1 && day <= 10) {
      return {
        slot: 'slot1',
        payPeriod: feeSlots.slot1.pay,
        duePeriod: feeSlots.slot1.due
      };
    } else if (day >= 11 && day <= 20) {
      return {
        slot: 'slot2',
        payPeriod: feeSlots.slot2.pay,
        duePeriod: feeSlots.slot2.due
      };
    } else {
      return {
        slot: 'slot3',
        payPeriod: feeSlots.slot3.pay,
        duePeriod: feeSlots.slot3.due
      };
    }
  }, []); // Empty dependency array since it doesn't depend on any props or state

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [clients, setClients] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const recordsPerPage = 15; // Increased from 9 to 15 to show more clients per slot
  
  // Add confirmation dialog before sending reminders
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [reminderSummary, setReminderSummary] = useState(null);

  // Function to format date
  const formatDate = (date) => {
    if (!date) return 'Not Set';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Show notification helper function
  const showNotification = useCallback((type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 5000);
  }, []);
  
  // Function to fetch reminder history
  const fetchReminderHistory = async (clientId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/clients/${clientId}/reminders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching reminder history:', error);
      showNotification('error', 'Failed to load reminder history');
      return [];
    }
  };

  // Function to handle viewing reminder history
  const handleViewHistory = async (clientId) => {
    const history = await fetchReminderHistory(clientId);
    setReminderHistory(history);
    setShowHistory(true);
  };
  
  // Function to toggle automated reminders on/off
  const toggleAutomatedReminders = () => {
    setAutomatedStatus(prev => ({
      ...prev,
      enabled: !prev.enabled
    }));
  };

  // Function to render filter controls with enhanced search
  const renderFilterControls = () => (
    <div className="filter-controls">
      <div className="search-box">
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
      </div>
      <div className="filter-selects">
        <select 
          value={filterOptions.status} 
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>

        <select 
          value={filterOptions.slot} 
          onChange={(e) => handleFilterChange('slot', e.target.value)}
          className="filter-select"
        >
          <option value="all">All Slots</option>
          <option value="slot1">Slot 1 (1st-10th)</option>
          <option value="slot2">Slot 2 (11th-20th)</option>
          <option value="slot3">Slot 3 (21st-31st)</option>
        </select>
      </div>
    </div>
  );

  // Optimized filter function that doesn't trigger state updates
  const filterClients = useCallback((search, options, clientsList) => {
    if (!clientsList?.length) return [];
    
    let filtered = [...clientsList];

    // Apply search filter
    if (search.trim() !== '') {
      filtered = filtered.filter(client => 
        (client.name?.toLowerCase().includes(search.toLowerCase())) ||
        (client.email?.toLowerCase().includes(search.toLowerCase())) ||
        (client.phone?.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Apply status filter
    if (options.status !== 'all') {
      filtered = filtered.filter(client => 
        (client.paymentStatus || 'pending').toLowerCase() === options.status.toLowerCase()
      );
    }

    // Apply slot filter
    if (options.slot !== 'all') {
      filtered = filtered.filter(client => {
        if (!client.feeDueDate) return false;
        const day = new Date(client.feeDueDate).getDate();
        switch(options.slot) {
          case 'slot1':
            return day >= 1 && day <= 10;
          case 'slot2':
            return day >= 11 && day <= 20;
          case 'slot3':
            return day >= 21 && day <= 31;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, []); // No dependencies needed as it's a pure function

  // Updated search handler that applies filters without triggering re-renders
  const handleSearch = useCallback((e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);
    
    // Apply filters to existing allClients
    const filteredData = filterClients(searchValue, filterOptions, allClients);
    setClients(filteredData);
    // Reset to first page when searching
    setCurrentPage(1);
  }, [filterOptions, filterClients, allClients]);

  // Updated filter change handler
  const handleFilterChange = useCallback((type, value) => {
    const newOptions = { ...filterOptions, [type]: value };
    setFilterOptions(newOptions);
    
    // Apply new filters to existing allClients
    const filteredData = filterClients(searchTerm, newOptions, allClients);
    setClients(filteredData);
    // Reset to first page when filtering
    setCurrentPage(1);
  }, [filterOptions, searchTerm, filterClients, allClients]);

  // Function to organize clients by slots with pagination
  const organizeClientsBySlots = (clientsList) => {
    const organized = {
      slot1: [], // 1st - 10th
      slot2: [], // 11th - 20th
      slot3: [], // 21st - 31st
    };

    // Organize clients into slots
    clientsList.forEach(client => {
      if (client.feeDueDate) {
        const dueDate = new Date(client.feeDueDate);
        const day = dueDate.getDate();
        
        // Add payment status and last reminder info
        const clientWithStatus = {
          ...client,
          lastReminderDate: client.lastReminderSent ? new Date(client.lastReminderSent) : null,
          paymentStatus: client.paymentStatus || 'pending'
        };
        
        if (day >= 1 && day <= 10) {
          organized.slot1.push(clientWithStatus);
        } else if (day >= 11 && day <= 20) {
          organized.slot2.push(clientWithStatus);
        } else {
          organized.slot3.push(clientWithStatus);
        }
      }
    });

    // Sort clients within each slot by due date and payment status
    Object.keys(organized).forEach(slot => {
      organized[slot].sort((a, b) => {
        // Sort by payment status first (pending first)
        if (a.paymentStatus === 'pending' && b.paymentStatus !== 'pending') return -1;
        if (a.paymentStatus !== 'pending' && b.paymentStatus === 'pending') return 1;
        // Then by due date
        return new Date(a.feeDueDate) - new Date(b.feeDueDate);
      });
    });

    return organized;
  };

  // Optimized fetchClients function that separates data fetching from filtering
  const fetchClients = useCallback(async (page) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        showNotification('error', 'Authentication token missing. Please log in again.');
        return;
      }

      // Fetch clients from API
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/clients?page=${page}&limit=${recordsPerPage}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      let clientsData = [];
      if (response.data && response.data.clients) {
        clientsData = response.data.clients;
        // Calculate total pages based on total count from backend
        const totalCount = response.data.total || 0;
        setTotalPages(Math.ceil(totalCount / recordsPerPage));
      } else if (Array.isArray(response.data)) {
        // If backend returns array directly, slice it to show correct number per page
        const startIndex = (page - 1) * recordsPerPage;
        const endIndex = startIndex + recordsPerPage;
        clientsData = response.data.slice(startIndex, endIndex);
        setTotalPages(Math.ceil(response.data.length / recordsPerPage));
      } else {
        setAllClients([]);
        setClients([]);
        setTotalPages(0);
        showNotification('warning', 'No client data found');
        setLoading(false);
        return;
      }

      setAllClients(clientsData);
      
      // Apply filters to the new data
      const filteredData = filterClients(searchTerm, filterOptions, clientsData);
      setClients(filteredData);
      
      if (clientsData.length === 0) {
        showNotification('info', 'No clients found for the current filters');
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      let errorMessage = 'Failed to load clients. Please try again.';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 401) {
          errorMessage = 'Session expired. Please log in again.';
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to access this resource.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'Network error. Please check your connection.';
      }
      
      showNotification('error', errorMessage);
      setClients([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [recordsPerPage, filterClients, searchTerm, filterOptions, showNotification]);

  // Function to render clients grouped by slots
  const renderClientsList = () => {
    const organizedClients = organizeClientsBySlots(clients);

    return (
      <div className="clients-list-container">
        {Object.entries(organizedClients)
          .filter(([slot, _]) => filterOptions.slot === 'all' || filterOptions.slot === slot)
          .map(([slot, slotClients]) => (
          <div key={slot} className="slot-group">
            <div className="slot-header">
              <h4 className="slot-title">
                {slot === 'slot1' && 'Slot 1: Pay 1st - 5th (Due: 1st - 10th)'}
                {slot === 'slot2' && 'Slot 2: Pay 15th - 20th (Due: 11th - 20th)'}
                {slot === 'slot3' && 'Slot 3: Pay 25th - 30th (Due: 21st - 31st)'}
              </h4>
              <span className="client-count">
                {slotClients.length} clients
              </span>
            </div>
            <div className="clients-list">
              {slotClients.length > 0 ? (
                slotClients.map(client => {
                  const isPaid = client.paymentStatus === 'paid';
                  const isOverdue = client.paymentStatus === 'overdue';
                  const statusClass = isPaid ? 'paid' : (isOverdue ? 'overdue' : '');
                  
                  return (
                    <div
                      key={client._id}
                      className={`client-item ${selectedClients.includes(client._id) ? 'selected' : ''} ${statusClass}`}
                    >
                      <label>
                        <input
                          type="checkbox"
                          checked={selectedClients.includes(client._id)}
                          onChange={() => handleSelectClient(client._id)}
                          disabled={isPaid} // Disable selection for paid clients
                        />
                        <div className="client-info">
                          <h4>{client.name}</h4>
                          <p>{client.email}</p>
                          <p className="due-date">
                            Due: {formatDate(client.feeDueDate)}
                          </p>
                          <div className="client-status">
                            <span 
                              className={`status-badge ${client.paymentStatus}`}
                              style={{ backgroundColor: STATUS_COLORS[client.paymentStatus] }}
                            >
                              {client.paymentStatus.charAt(0).toUpperCase() + client.paymentStatus.slice(1)}
                            </span>
                            {client.lastReminderDate && (
                              <span className="last-reminder">
                                Last Reminder: {formatDate(client.lastReminderDate)}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            className="view-history-btn"
                            onClick={() => handleViewHistory(client._id)}
                          >
                            View History
                          </button>
                        </div>
                      </label>
                    </div>
                  );
                })
              ) : (
                <div className="no-clients-in-slot">
                  No clients in this slot
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  useEffect(() => {
    fetchClients(currentPage);
  }, [currentPage, fetchClients]);
  
  // Remove the separate filter effect as filtering is now handled in the handlers
  
  // Separate useEffect for initializing the message
  useEffect(() => {
    // Initialize message based on current date when component mounts
    const initialSlotInfo = determinePaymentSlot(formData.dueDate);
    const initialMessage = `Your fee payment is due. Please pay between ${initialSlotInfo.payPeriod} of this month.`;
    
    setFormData(prev => ({
      ...prev,
      message: initialMessage,
      paymentSlot: initialSlotInfo.slot
    }));
  }, [formData.dueDate, determinePaymentSlot]);  // Added determinePaymentSlot to dependencies

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Reset selections when changing pages
    setSelectedClients([]);
    setSelectAll(false);
  };

  const validateForm = () => {
    const newErrors = {};

    if (selectedClients.length === 0) {
      newErrors.clients = 'Please select at least one client';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSelectClient = (clientId) => {
    const isAlreadySelected = selectedClients.includes(clientId);
    const newSelectedClients = isAlreadySelected
      ? selectedClients.filter(id => id !== clientId)
      : [...selectedClients, clientId];
    
    // console.log(`Client ${clientId} ${isAlreadySelected ? 'deselected' : 'selected'}, total selected: ${newSelectedClients.length}`);
    setSelectedClients(newSelectedClients);
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    
    if (!checked) {
      setSelectedClients([]);
      return;
    }
    
    // Get organized clients with filters applied
    const organizedClients = organizeClientsBySlots(clients);
    
    // Create a flat array of client IDs that match the current filters
    let filteredClientIds = [];
    
    Object.entries(organizedClients)
      .filter(([slot, _]) => filterOptions.slot === 'all' || filterOptions.slot === slot)
      .forEach(([_, slotClients]) => {
        // Only select clients that aren't paid
        const slotIds = slotClients
          .filter(client => client.paymentStatus !== 'paid')
          .map(client => client._id);
        
        filteredClientIds = [...filteredClientIds, ...slotIds];
      });
    
    setSelectedClients(filteredClientIds);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Show confirmation dialog with summary
    const summary = {
      totalSelected: selectedClients.length,
      slot: currentSlotInfo.payPeriod,
      dueDate: formatDate(formData.dueDate),
      message: formData.message
    };
    setReminderSummary(summary);
    setShowConfirmation(true);
  };

  // Function to actually send reminders after confirmation
  const sendReminders = async () => {
    setLoading(true);
    setShowConfirmation(false);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        showNotification('error', 'Authentication token missing. Please log in again.');
        setLoading(false);
        return;
      }
      
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/reminders`, {
        clientIds: selectedClients,
        dueDate: formData.dueDate,
        message: formData.message,
        paymentSlot: formData.paymentSlot // Use the stored payment slot
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Handle the response
      if (response.data.results) {
        const { successCount, failureCount } = response.data.results;
        
        if (failureCount > 0) {
          showNotification('warning', `Reminders sent to ${successCount} clients, but failed for ${failureCount} clients.`);
        } else {
          showNotification('success', `Reminders successfully sent to ${successCount} clients.`);
        }
        
        setShowSuccess(true);
      } else {
        showNotification('success', 'Reminders sent successfully!');
        setShowSuccess(true);
      }
      
      // Refresh client list to show updated reminder status
      fetchClients(currentPage);
      
      // Reset form
      setTimeout(() => {
        setShowSuccess(false);
        setFormData({
          dueDate: new Date(),
          message: '',
          paymentSlot: ''
        });
        setSelectedClients([]);
        setSelectAll(false);
      }, 3000);
    } catch (error) {
      console.error('Error sending reminders:', error);
      let errorMessage = 'Failed to send reminders. Please try again.';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Session expired. Please log in again.';
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to send reminders.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      showNotification('error', errorMessage);
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date) => {
    const slotInfo = determinePaymentSlot(date);
    const defaultMessage = `Your fee payment is due. Please pay between ${slotInfo.payPeriod} of this month.`;
    
    setFormData(prev => ({
      ...prev,
      dueDate: date,
      message: defaultMessage,
      paymentSlot: slotInfo.slot
    }));

    if (errors.dueDate) {
      setErrors(prev => ({
        ...prev,
        dueDate: ''
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Render reminder history modal
  const renderHistoryModal = () => {
    if (!showHistory) return null;

    return (
      <div className="history-modal">
        <div className="history-content">
          <h3>Reminder History</h3>
          <div className="history-list">
            {reminderHistory.length > 0 ? (
              reminderHistory.map((reminder, index) => (
                <div key={index} className="history-item">
                  <p>Sent: {formatDate(reminder.sentAt)}</p>
                  <p>Type: {reminder.type || 'Manual'}</p>
                  <p>Status: {reminder.status}</p>
                  {reminder.error && <p className="error">Error: {reminder.error}</p>}
                </div>
              ))
            ) : (
              <p>No reminder history available</p>
            )}
          </div>
          <button onClick={() => setShowHistory(false)}>Close</button>
        </div>
      </div>
    );
  };

  // Confirmation Dialog Component
  const ConfirmationDialog = ({ summary, onConfirm, onCancel }) => (
    <div className="confirmation-modal">
      <div className="confirmation-content">
        <h3>Confirm Reminder</h3>
        <div className="confirmation-summary">
          <p><strong>You are about to send reminders to {summary.totalSelected} clients</strong></p>
          <p><strong>Payment Period:</strong> {summary.slot}</p>
          <p><strong>Due Date:</strong> {summary.dueDate}</p>
          <div className="message-preview">
            <p><strong>Message Preview:</strong></p>
            <p className="message-text">{summary.message}</p>
          </div>
        </div>
        <div className="confirmation-actions">
          <button 
            onClick={onConfirm} 
            className="confirm-button"
          >
            Confirm & Send
          </button>
          <button 
            onClick={onCancel}
            className="cancel-button"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  // Add automated reminder status section
  const renderAutomatedStatus = () => (
    <div className="automated-status">
      <h3>Automated Reminders</h3>
      <div className="status-info">
        <p>
          <span className={`status-indicator ${automatedStatus.enabled ? 'active' : 'inactive'}`}></span>
          Status: {automatedStatus.enabled ? 'Active' : 'Inactive'}
        </p>
        <button 
          onClick={toggleAutomatedReminders}
          className="toggle-button"
        >
          {automatedStatus.enabled ? 'Disable' : 'Enable'} Automated Reminders
        </button>
        {automatedStatus.nextRun && (
          <p>Next scheduled run: {formatDate(automatedStatus.nextRun)}</p>
        )}
      </div>
      <div className="slot-schedule">
        <p>Daily Schedule:</p>
        <ul>
          <li>Slot 1 (1st-5th): 10:00 AM</li>
          <li>Slot 2 (15th-20th): 10:00 AM</li>
          <li>Slot 3 (25th-30th): 10:00 AM</li>
        </ul>
      </div>
    </div>
  );

  // Get current slot information
  const currentSlotInfo = determinePaymentSlot(formData.dueDate);

  // Notification component
  const NotificationComponent = () => {
    if (!notification.show) return null;
    
    return (
      <div className={`notification-toast ${notification.type}`}>
        <div className="notification-content">
          <span className="notification-icon">
            {notification.type === 'success' && '✓'}
            {notification.type === 'error' && '✕'}
            {notification.type === 'warning' && '⚠'}
            {notification.type === 'info' && 'ℹ'}
          </span>
          <span className="notification-message">{notification.message}</span>
        </div>
        <button 
          className="notification-close" 
          onClick={() => setNotification({...notification, show: false})}
        >
          ×
        </button>
      </div>
    );
  };

  return (
    <div className="send-reminder-container">
      <h1>Fee Reminders</h1>
      <p className="subtitle">Manage and send fee payment reminders</p>
      
      {/* Notification component */}
      <NotificationComponent />
      
      <style jsx>{`
        .filter-controls {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 15px;
          align-items: center;
        }
        
        /* Confirmation Dialog Styles */
        .confirmation-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .confirmation-content {
          background-color: white;
          padding: 25px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          max-width: 500px;
          width: 90%;
        }
        
        .confirmation-summary {
          margin: 20px 0;
        }
        
        .message-preview {
          margin-top: 15px;
          padding: 10px;
          background-color: #f9f9f9;
          border-radius: 4px;
          border-left: 3px solid #007bff;
        }
        
        .message-text {
          white-space: pre-wrap;
          color: #555;
        }
        
        .confirmation-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }
        
        .confirm-button {
          background-color: #28a745;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }
        
        .cancel-button {
          background-color: #dc3545;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .filter-controls select {
          padding: 8px;
          border-radius: 4px;
          border: 1px solid #ccc;
          background-color: white;
          min-width: 150px;
        }
        
        .search-box input {
          padding: 8px 12px;
          border-radius: 4px;
          border: 1px solid #ccc;
          width: 250px;
        }
        
        .filter-selects {
          display: flex;
          gap: 10px;
        }
        
        .selection-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          flex-wrap: wrap;
        }
        
        .status-summary-container {
          margin: 20px 0;
          padding: 15px;
          background-color: #f9f9f9;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .status-summary {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          align-items: center;
        }
        
        .status-counters {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          flex: 1;
        }
        
        .status-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 15px;
          background-color: white;
          border-radius: 8px;
          border-left: 5px solid #ddd;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          min-width: 100px;
        }
        
        .status-label {
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .status-count {
          font-size: 24px;
          font-weight: bold;
        }
        
        .status-chart {
          flex: 1;
          min-width: 300px;
          height: 200px;
        }
        
        @media (max-width: 768px) {
          .selection-controls {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .filter-controls {
            margin-top: 10px;
            width: 100%;
          }
          
          .search-box input {
            width: 100%;
          }
          
          .status-summary {
            flex-direction: column;
          }
          
          .status-chart {
            width: 100%;
          }
        }
      `}</style>
      
      {/* Automated Reminder Status */}
      {renderAutomatedStatus()}

      {/* Status Summary */}
      <StatusSummary clients={clients} />

      {showSuccess && (
        <div className="success-message">
          <i className="success-icon">✓</i>
          <span>Reminders sent successfully!</span>
        </div>
      )}

      {/* Fee Slot Information */}
      <div className="fee-slot-info">
        <h3>Fee Payment Slots</h3>
        <div className="slot-details">
          <p><strong>Current Selection:</strong> Due date falls in {currentSlotInfo.duePeriod}</p>
          <p><strong>Payment Period:</strong> {currentSlotInfo.payPeriod}</p>
        </div>
        <div className="all-slots">
          {Object.entries(feeSlots).map(([key, slot]) => (
            <div key={key} className="slot-item">
              <p><strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong></p>
              <p>Pay between: {slot.pay}</p>
              <p>Due dates: {slot.due}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Client Selection */}
      <div className="client-selection">
        <h3>Select Clients</h3>

        <div className="selection-controls">
          <div className="select-all-container">
            <label>
              <input
                type="checkbox"
                checked={selectAll}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
              <strong>Select All Clients</strong>
            </label>
            <span className="selected-count">
              {selectedClients.length} clients selected
            </span>
          </div>
          
          {/* Add filter controls */}
          {renderFilterControls()}
        </div>

        {errors.clients && <span className="error-message">{errors.clients}</span>}

        {loading ? (
          <div className="loading-message">Loading clients...</div>
        ) : clients && clients.length > 0 ? (
          renderClientsList()
        ) : (
          <div className="no-clients-message">No clients found</div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              Previous
            </button>
            
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
              >
                {index + 1}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="reminder-form">

        <div className="form-group">
          <label htmlFor="dueDate">Due Date</label>
          <DatePicker
            selected={formData.dueDate}
            onChange={handleDateChange}
            className={errors.dueDate ? 'error' : ''}
            dateFormat="yyyy-MM-dd"
            minDate={new Date()}   // Disable past dates
            placeholderText="Select due date"
          />
          {errors.dueDate && <span className="error-message">{errors.dueDate}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            className={errors.message ? 'error' : ''}
            placeholder="Enter reminder message"
            rows="4"
          />
          {errors.message && <span className="error-message">{errors.message}</span>}
        </div>

        {errors.submit && <div className="error-message">{errors.submit}</div>}

        <button type="submit" className={`submit-button ${loading ? 'loading' : ''}`} disabled={loading}>
          {loading ? <span className="loader"></span> : 'Send Reminders'}
        </button>
      </form>
      
      {/* Add History Modal */}
      {renderHistoryModal()}
      
      {/* Confirmation Dialog */}
      {showConfirmation && reminderSummary && (
        <ConfirmationDialog 
          summary={reminderSummary}
          onConfirm={sendReminders}
          onCancel={() => setShowConfirmation(false)}
        />
      )}
    </div>
  );
};

export default SendReminder;
