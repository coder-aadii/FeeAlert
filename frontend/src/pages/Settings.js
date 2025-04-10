import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import './Settings.css';

const Settings = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    emailNotifications: false,
    reminderFrequency: 'weekly'
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        emailNotifications: user.preferences?.emailNotifications || false,
        reminderFrequency: user.preferences?.reminderFrequency || 'weekly'
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put('/api/users/profile', {
        name: formData.name,
        email: formData.email,
        preferences: {
          emailNotifications: formData.emailNotifications,
          reminderFrequency: formData.reminderFrequency
        }
      });

      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await axios.put('/api/users/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      toast.success('Password changed successfully');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await axios.delete('/api/users/account');
        toast.success('Account deleted successfully');
        logout();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete account');
      }
    }
  };

  return (
    <div className="settings-container">
      <h1 className="settings-title">Settings</h1>

      {/* Profile Settings */}
      <section className="settings-section">
        <h2 className="settings-section-title">Profile Settings</h2>
        <form onSubmit={updateProfile}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </section>

      {/* Password Change */}
      <section className="settings-section">
        <h2 className="settings-section-title">Change Password</h2>
        <form onSubmit={changePassword}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            Change Password
          </button>
        </form>
      </section>

      {/* Notification Preferences */}
      <section className="settings-section">
        <h2 className="settings-section-title">Notification Preferences</h2>
        <div className="form-group">
          <label className="checkbox-group">
            <input
              type="checkbox"
              name="emailNotifications"
              checked={formData.emailNotifications}
              onChange={handleInputChange}
              className="checkbox-input"
            />
            Receive email notifications
          </label>
        </div>
        <div className="form-group">
          <label className="form-label">Reminder Frequency</label>
          <select
            name="reminderFrequency"
            value={formData.reminderFrequency}
            onChange={handleInputChange}
            className="form-select"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <button
          onClick={updateProfile}
          disabled={loading}
          className="btn btn-primary"
        >
          Save Preferences
        </button>
      </section>

      {/* Danger Zone */}
      <section className="danger-zone">
        <h2 className="danger-zone-title">Danger Zone</h2>
        <p className="danger-zone-text">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          onClick={deleteAccount}
          className="btn btn-danger"
        >
          Delete Account
        </button>
      </section>
    </div>
  );
};

export default Settings;
