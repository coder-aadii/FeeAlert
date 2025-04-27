
const Client = require('../models/clientModel');

// Get all clients with pagination
exports.getClients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const total = await Client.countDocuments();
    const clients = await Client.find()
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);
    
    res.json({
      clients,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching clients', error: error.message });
  }
};

// Get a single client
exports.getClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching client', error: error.message });
  }
};

// Add new client
exports.addClient = async (req, res) => {
  try {
    const client = await Client.create(req.body);
    res.status(201).json(client);
  } catch (error) {
    res.status(400).json({ message: 'Error adding client', error: error.message });
  }
};

// Update client
exports.updateClient = async (req, res) => {
  try {
    // If updating membership status, validate the value
    if (req.body.membershipStatus) {
      const validStatuses = ['Active', 'Inactive', 'Suspended'];
      if (!validStatuses.includes(req.body.membershipStatus)) {
        return res.status(400).json({ 
          message: 'Invalid membership status', 
          validValues: validStatuses 
        });
      }
    }

    const client = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    res.json(client);
  } catch (error) {
    res.status(400).json({ message: 'Error updating client', error: error.message });
  }
};

// Update client membership status
exports.updateMembershipStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Membership status is required' });
    }
    
    const validStatuses = ['Active', 'Inactive', 'Suspended'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid membership status', 
        validValues: validStatuses 
      });
    }
    
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { membershipStatus: status },
      { new: true, runValidators: true }
    );
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    res.json(client);
  } catch (error) {
    res.status(400).json({ message: 'Error updating membership status', error: error.message });
  }
};

// Delete client
exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting client', error: error.message });
  }
};

// Get clients eligible for reminders (active clients only)
exports.getClientsForReminders = async (req, res) => {
  try {
    const clients = await Client.find({ membershipStatus: 'Active' });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching clients for reminders', error: error.message });
  }
};
