const History = require('../models/History');
const Client = require('../models/clientModel');
const Email = require('../controllers/emailController');

// Helper function to create history entries when sending reminders
const createReminderHistory = async (userId, client, reminderType, status, description, metadata = {}) => {
  try {
    const historyEntry = await History.create({
      userId,
      clientId: client._id,
      type: 'reminder',
      title: `Fee Reminder - ${client.name}`,
      description: description || `Fee reminder sent to ${client.name}`,
      status,
      reminderType,
      clientDetails: {
        name: client.name,
        email: client.email,
        phone: client.phone,
        feeDueDate: client.feeDueDate,
        membershipStatus: client.membershipStatus
      },
      metadata
    });

    // console.log('Created history entry:', historyEntry._id);
    return historyEntry;
  } catch (error) {
    console.error('Error creating reminder history:', error);
    throw error;
  }
};

// Send reminder function
const sendReminder = async (req, res) => {
  try {
    const { clientIds, reminderType } = req.body;
    const results = [];

    for (const clientId of clientIds) {
      try {
        const client = await Client.findById(clientId);
        if (!client) {
          results.push({ clientId, status: 'failed', message: 'Client not found' });
          continue;
        }

        // Check if client has active membership status
        if (client.membershipStatus !== 'Active') {
          const description = `Reminder not sent: Client has ${client.membershipStatus} membership status`;
          
          // Create history entry for skipped reminder
          await createReminderHistory(
            req.user.id,
            client,
            reminderType,
            'skipped',
            description,
            { reason: 'inactive_membership' }
          );
          
          results.push({ 
            clientId, 
            status: 'skipped', 
            message: description 
          });
          
          continue; // Skip to next client
        }

        let status = 'pending';
        let description = '';
        const metadata = {};

        try {
          if (reminderType === 'sms' || reminderType === 'both') {
            const smsResult = await Email.sendSMS(client.phone, generateReminderMessage(client));
            metadata.smsId = smsResult.messageId;
          }
          
          if (reminderType === 'email' || reminderType === 'both') {
            const emailResult = await Email.sendEmail(client.email, 'Fee Reminder', generateReminderMessage(client));
            metadata.emailId = emailResult.messageId;
          }

          status = 'success';
          description = `Reminder sent successfully via ${reminderType}`;
          results.push({ clientId, status, message: 'Reminder sent successfully' });
        } catch (error) {
          status = 'failed';
          description = `Failed to send reminder: ${error.message}`;
          metadata.errorDetails = error.message;
          results.push({ clientId, status, message: error.message });
        }

        // Create history entry
        await createReminderHistory(
          req.user.id,
          client,
          reminderType,
          status,
          description,
          metadata
        );
      } catch (error) {
        console.error(`Error processing client ${clientId}:`, error);
        results.push({ clientId, status: 'failed', message: error.message });
      }
    }

    res.json({ 
      message: 'Reminder process completed',
      results 
    });
  } catch (error) {
    console.error('Error in sendReminder:', error);
    res.status(500).json({ 
      message: 'Error sending reminders',
      error: error.message 
    });
  }
};

// Helper function to generate reminder message
const generateReminderMessage = (client) => {
  const dueDate = client.feeDueDate ? 
    new Date(client.feeDueDate).toLocaleDateString() : 
    'not set';

  return `Dear ${client.name},\n\nThis is a reminder that your fee payment is due on ${dueDate}. Please ensure timely payment.\n\nThank you.`;
};

// Get clients eligible for reminders (active clients only)
const getEligibleClients = async (req, res) => {
  try {
    const clients = await Client.find({ membershipStatus: 'Active' });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching eligible clients', 
      error: error.message 
    });
  }
};

module.exports = {
  sendReminder,
  createReminderHistory,
  getEligibleClients
};
