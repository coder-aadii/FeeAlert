import React, { useState } from 'react';
import api from '../utils/api';

const EmailReminderForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    feeAmount: '',
    dueDate: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/email/send', formData);
      alert('Email reminder set successfully');
      setFormData({ name: '', email: '', feeAmount: '', dueDate: '' });
    } catch (error) {
      alert('Error setting email reminder');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Client Name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div className="mb-4">
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div className="mb-4">
        <input
          type="number"
          placeholder="Fee Amount"
          value={formData.feeAmount}
          onChange={(e) => setFormData({...formData, feeAmount: e.target.value})}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div className="mb-4">
        <input
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Set Email Reminder
      </button>
    </form>
  );
};

export default EmailReminderForm;