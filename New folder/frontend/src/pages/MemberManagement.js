import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MemberManagement = () => {
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    feeAmount: '',
    dueDate: '',
    reminderType: 'email'
  });
  const [editingId, setEditingId] = useState(null);

  // Fetch members
  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/members', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingId) {
        await axios.put(`http://localhost:5000/api/members/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/members', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchMembers();
      resetForm();
    } catch (error) {
      console.error('Error saving member:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/members/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchMembers();
      } catch (error) {
        console.error('Error deleting member:', error);
      }
    }
  };

  const handleEdit = (member) => {
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      feeAmount: member.feeAmount,
      dueDate: member.dueDate.split('T')[0],
      reminderType: member.reminderType
    });
    setEditingId(member._id);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      feeAmount: '',
      dueDate: '',
      reminderType: 'email'
    });
    setEditingId(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Member Management</h1>
      
      {/* Member Form */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="border p-2 rounded"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="border p-2 rounded"
            required
          />
          <input
            type="tel"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="border p-2 rounded"
            required
          />
          <input
            type="number"
            placeholder="Fee Amount"
            value={formData.feeAmount}
            onChange={(e) => setFormData({...formData, feeAmount: e.target.value})}
            className="border p-2 rounded"
            required
          />
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
            className="border p-2 rounded"
            required
          />
          <select
            value={formData.reminderType}
            onChange={(e) => setFormData({...formData, reminderType: e.target.value})}
            className="border p-2 rounded"
          >
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="both">Both</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {editingId ? 'Update Member' : 'Add Member'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Members List */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Fee Amount</th>
              <th className="px-4 py-2">Due Date</th>
              <th className="px-4 py-2">Reminder Type</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member._id} className="border-b">
                <td className="px-4 py-2">{member.name}</td>
                <td className="px-4 py-2">{member.email}</td>
                <td className="px-4 py-2">{member.phone}</td>
                <td className="px-4 py-2">${member.feeAmount}</td>
                <td className="px-4 py-2">{new Date(member.dueDate).toLocaleDateString()}</td>
                <td className="px-4 py-2">{member.reminderType}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleEdit(member)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(member._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberManagement;