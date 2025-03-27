/*
const Client = require('../models/clientModel');
const sendSMS = require('../utils/sendSMS');

exports.sendSMSReminder = async (req, res) => {
  try {
    const { clientId } = req.params;
    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    await sendSMS({
      to: client.phone,
      message: `Dear ${client.name}, this is a reminder that your payment of $${client.feeAmount} is due on ${client.dueDate}. - FeeAlert`
    });

    res.status(200).json({ message: 'SMS reminder sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending SMS reminder', error: error.message });
  }
};
*/

// SMS functionality temporarily disabled
exports.sendSMSReminder = async (req, res) => {
  res.status(503).json({ message: 'SMS service is temporarily disabled' });
};
