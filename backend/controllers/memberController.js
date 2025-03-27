const Client = require('../models/clientModel');

// Get all members
exports.getMembers = async (req, res) => {
  try {
    const members = await Client.find().sort('-createdAt');
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching members', error: error.message });
  }
};

// Add new member
exports.addMember = async (req, res) => {
  try {
    const member = await Client.create(req.body);
    res.status(201).json(member);
  } catch (error) {
    res.status(400).json({ message: 'Error adding member', error: error.message });
  }
};

// Update member
exports.updateMember = async (req, res) => {
  try {
    const member = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json(member);
  } catch (error) {
    res.status(400).json({ message: 'Error updating member', error: error.message });
  }
};

// Delete member
exports.deleteMember = async (req, res) => {
  try {
    const member = await Client.findByIdAndDelete(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting member', error: error.message });
  }
};