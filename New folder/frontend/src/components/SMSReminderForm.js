import React, { useState } from 'react';
import api from '../utils/api';

const SMSReminderForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    feeAmount: '',
    dueDate: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/sms/send', formData);
      alert('SMS reminder set successfully');
      setFormData({ name: '', phone: '', feeAmount: '', dueDate: '' });
    } catch (error) {
      alert('Error setting SMS reminder');
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
          type="tel"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
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
        className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
      >
        Set SMS Reminder
      </button>
    </form>
  );
};

export default SMSReminderForm;