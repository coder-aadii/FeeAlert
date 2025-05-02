const Client = require('../models/clientModel');

// Get payment history
exports.getPaymentHistory = async (req, res) => {
  try {
    // Aggregate payment history from all clients
    const clients = await Client.find({
      'paymentHistory.0': { $exists: true } // Only clients with payment history
    }).select('name email paymentHistory');

    // Extract and flatten payment history
    let paymentHistory = [];
    clients.forEach(client => {
      const clientPayments = client.paymentHistory.map(payment => ({
        clientId: client._id,
        clientName: client.name,
        clientEmail: client.email,
        ...payment.toObject(),
        date: payment.date
      }));
      paymentHistory = [...paymentHistory, ...clientPayments];
    });

    // Sort by date (newest first)
    paymentHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(paymentHistory);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ message: 'Error fetching payment history' });
  }
};

// Get reminder history
exports.getReminderHistory = async (req, res) => {
  try {
    // Aggregate reminder history from all clients
    const clients = await Client.find({
      'reminderHistory.0': { $exists: true } // Only clients with reminder history
    }).select('name email reminderHistory');

    // Extract and flatten reminder history
    let reminderHistory = [];
    clients.forEach(client => {
      const clientReminders = client.reminderHistory.map(reminder => ({
        clientId: client._id,
        clientName: client.name,
        clientEmail: client.email,
        ...reminder.toObject(),
        sentAt: reminder.sentAt
      }));
      reminderHistory = [...reminderHistory, ...clientReminders];
    });

    // Sort by date (newest first)
    reminderHistory.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));

    res.json(reminderHistory);
  } catch (error) {
    console.error('Error fetching reminder history:', error);
    res.status(500).json({ message: 'Error fetching reminder history' });
  }
};

// Get combined activity history (payments and reminders)
exports.getActivityHistory = async (req, res) => {
  try {
    // Get both payment and reminder history
    const clients = await Client.find({
      $or: [
        { 'paymentHistory.0': { $exists: true } },
        { 'reminderHistory.0': { $exists: true } }
      ]
    }).select('name email paymentHistory reminderHistory');

    // Extract and combine histories
    let activityHistory = [];

    clients.forEach(client => {
      // Add payment activities
      if (client.paymentHistory && client.paymentHistory.length > 0) {
        const paymentActivities = client.paymentHistory.map(payment => ({
          type: 'payment',
          clientId: client._id,
          clientName: client.name,
          clientEmail: client.email,
          timestamp: payment.date,
          details: {
            amount: payment.amount,
            method: payment.method || 'Not specified',
            reference: payment.reference || 'None'
          }
        }));
        activityHistory = [...activityHistory, ...paymentActivities];
      }

      // Add reminder activities
      if (client.reminderHistory && client.reminderHistory.length > 0) {
        const reminderActivities = client.reminderHistory.map(reminder => ({
          type: 'reminder',
          clientId: client._id,
          clientName: client.name,
          clientEmail: client.email,
          timestamp: reminder.sentAt,
          details: {
            type: reminder.type || 'Not specified',
            status: reminder.status || 'Unknown',
            messageId: reminder.messageId || 'None'
          }
        }));
        activityHistory = [...activityHistory, ...reminderActivities];
      }
    });

    // Sort by timestamp (newest first)
    activityHistory.sort((a, b) => {
      const dateA = a.timestamp ? new Date(a.timestamp) : new Date(0);
      const dateB = b.timestamp ? new Date(b.timestamp) : new Date(0);
      return dateB - dateA;
    });

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedResults = {
      total: activityHistory.length,
      page,
      pages: Math.ceil(activityHistory.length / limit),
      activities: activityHistory.slice(startIndex, endIndex)
    };

    res.json(paginatedResults);
  } catch (error) {
    console.error('Error fetching activity history:', error);
    res.status(500).json({ message: 'Error fetching activity history' });
  }
};
