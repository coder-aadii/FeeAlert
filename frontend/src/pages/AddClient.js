import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AddClient.css';

const AddClient = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    feeAmount: '',
    feeDueDate: '',
    membershipStatus: 'Active',
    reminderPreferences: {
      email: true,
      sms: false
    },
    notes: ''
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle nested fields for reminder preferences
    if (name.startsWith('reminder_')) {
      const prefType = name.split('_')[1]; // Extract 'email' or 'sms'
      setFormData(prev => ({
        ...prev,
        reminderPreferences: {
          ...prev.reminderPreferences,
          [prefType]: e.target.checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Determine payment slot based on due date
  const getPaymentSlot = (dueDate) => {
    if (!dueDate) return null;

    const day = new Date(dueDate).getDate();

    if (day >= 1 && day <= 10) {
      return 'slot1';
    } else if (day >= 11 && day <= 20) {
      return 'slot2';
    } else {
      return 'slot3';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate form data
      if (!formData.name.trim()) {
        throw new Error('Client name is required');
      }

      if (!formData.email.trim()) {
        throw new Error('Email address is required');
      }

      if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      if (!formData.phone.trim()) {
        throw new Error('Phone number is required');
      }

      if (!formData.feeAmount || isNaN(formData.feeAmount) || Number(formData.feeAmount) <= 0) {
        throw new Error('Please enter a valid fee amount');
      }

      if (!formData.feeDueDate) {
        throw new Error('Fee due date is required');
      }

      // Format the data for API
      const clientData = {
        ...formData,
        feeAmount: Number(formData.feeAmount),
        registrationDate: new Date().toISOString(),
        paymentSlot: getPaymentSlot(formData.feeDueDate),
        status: 'active',
        paymentStatus: 'pending',
        // Convert feeDueDate to proper format if it exists
        feeDueDate: formData.feeDueDate ? new Date(formData.feeDueDate).toISOString() : null
      };

      const authAxios = getAuthAxios();
      await authAxios.post('/api/clients', clientData);

      setSuccess(true);
      // Reset form after successful submission
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        feeAmount: '',
        feeDueDate: '',
        membershipStatus: 'Active',
        reminderPreferences: {
          email: true,
          sms: false
        },
        notes: ''
      });

      // Redirect after a short delay to show success message
      setTimeout(() => {
        navigate('/clients');
      }, 2000);
    } catch (err) {
      console.error('Error adding client:', err);

      if (err.response) {
        setError(`Server error: ${err.response.data?.message || err.response.statusText}`);
      } else if (err.request) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/clients');
  };

  // Calculate the current date and format it for the date input min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="add-client-container">
      <div className="add-client-header">
        <h1>Add New Client</h1>
        <p>Enter client details below to add them to your system</p>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="success-message">
          <p>Client added successfully! Redirecting to clients list...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="add-client-form">
        <div className="form-section">
          <h2>Basic Information</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Client Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter address"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Payment Information</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="feeAmount">Fee Amount (₹) *</label>
              <input
                type="number"
                id="feeAmount"
                name="feeAmount"
                value={formData.feeAmount}
                onChange={handleChange}
                placeholder="Enter fee amount"
                min="0"
                step="0.01"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="feeDueDate">Fee Due Date *</label>
              <input
                type="date"
                id="feeDueDate"
                name="feeDueDate"
                value={formData.feeDueDate}
                onChange={handleChange}
                min={today}
                required
                disabled={loading}
              />
              <small>
                {formData.feeDueDate && (
                  <>
                    Payment Slot: {
                      getPaymentSlot(formData.feeDueDate) === 'slot1' ? 'Slot 1 (1st-10th)' :
                        getPaymentSlot(formData.feeDueDate) === 'slot2' ? 'Slot 2 (11th-20th)' :
                          'Slot 3 (21st onwards)'
                    }
                  </>
                )}
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="membershipStatus">Membership Status</label>
              <select
                id="membershipStatus"
                name="membershipStatus"
                value={formData.membershipStatus}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
              <small>Active clients will receive payment reminders</small>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Reminder Preferences</h2>
          <div className="form-row checkbox-row">
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="reminder_email"
                name="reminder_email"
                checked={formData.reminderPreferences.email}
                onChange={handleChange}
                disabled={loading}
              />
              <label htmlFor="reminder_email">Send Email Reminders</label>
            </div>

            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="reminder_sms"
                name="reminder_sms"
                checked={formData.reminderPreferences.sms}
                onChange={handleChange}
                disabled={loading}
              />
              <label htmlFor="reminder_sms">Send SMS Reminders</label>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Additional Information</h2>
          <div className="form-group full-width">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Enter any additional notes about this client"
              rows="4"
              disabled={loading}
            ></textarea>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Adding Client...' : 'Add Client'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddClient;
