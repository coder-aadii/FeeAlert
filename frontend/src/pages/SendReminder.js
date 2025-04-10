import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './SendReminder.css';

const SendReminder = () => {
  // State variables
  const [formData, setFormData] = useState({
    dueDate: new Date(), // Initialize with current date
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [clients, setClients] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const recordsPerPage = 7;

  const fetchClients = async (page) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get(`http://localhost:5000/api/clients?page=${page}&limit=${recordsPerPage}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Handle both array response and object with clients property
      if (Array.isArray(response.data)) {
        setClients(response.data);
        setTotalPages(Math.ceil(response.data.length / recordsPerPage));
      } else if (response.data && response.data.clients) {
        setClients(response.data.clients);
        setTotalPages(Math.ceil(response.data.total / recordsPerPage));
      } else {
        console.error('Invalid response format:', response.data);
        setClients([]); // Set to empty array if invalid response
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients(currentPage);
  }, [currentPage]);

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
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    setSelectedClients(checked && clients ? clients.map(client => client._id) : []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await axios.post('http://localhost:5000/api/reminders', {
        clientIds: selectedClients,
        dueDate: formData.dueDate,
        message: formData.message
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        setFormData({
          dueDate: new Date(),
          message: ''
        });
        setSelectedClients([]);
        setSelectAll(false);
      }, 3000);
    } catch (error) {
      console.error('Error sending reminders:', error);
      setErrors({ submit: 'Failed to send reminders. Please try again.' });
    } finally {
      setLoading(false);
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

  return (
    <div className="send-reminder-container">
      <h1>Send Reminders</h1>
      <p className="subtitle">Select clients to send fee payment reminders</p>

      {showSuccess && (
        <div className="success-message">
          <i className="success-icon">✓</i>
          <span>Reminders sent successfully!</span>
        </div>
      )}

      {/* Client Selection */}
      <div className="client-selection">
        <h3>Select Clients</h3>

        <div className="select-all-container">
          <label>
            <input
              type="checkbox"
              checked={selectAll}
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
            <strong>Select All Clients</strong>
          </label>
        </div>

        {errors.clients && <span className="error-message">{errors.clients}</span>}

        <div className="clients-list">
          {loading ? (
            <div className="loading-message">Loading clients...</div>
          ) : clients && clients.length > 0 ? (
            clients.map(client => (
              <div
                key={client._id}
                className={`client-item ${selectedClients.includes(client._id) ? 'selected' : ''}`}
              >
                <label>
                  <input
                    type="checkbox"
                    checked={selectedClients.includes(client._id)}
                    onChange={() => handleSelectClient(client._id)}
                  />
                  <div className="client-info">
                    <h4>{client.name}</h4>
                    <p>{client.email}</p>
                  </div>
                </label>
              </div>
            ))
          ) : (
            <div className="no-clients-message">No clients found</div>
          )}
        </div>

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
            onChange={(date) => {
              setFormData(prev => ({
                ...prev,
                dueDate: date
              }));
              if (errors.dueDate) {
                setErrors(prev => ({
                  ...prev,
                  dueDate: ''
                }));
              }
            }}
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
    </div>
  );
};

export default SendReminder;
