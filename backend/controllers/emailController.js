const Client = require('../models/clientModel');
const sendEmail = require('../utils/sendEmail');

exports.sendEmailReminder = async (req, res) => {
  try {
    const { clientId } = req.params;
    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    await sendEmail({
      to: client.email,
      subject: 'Fee Payment Reminder',
      text: `Dear ${client.name},\n\nThis is a reminder that your payment of $${client.feeAmount} is due on ${client.dueDate}.\n\nBest regards,\nFeeAlert Team`
    });

    res.status(200).json({ message: 'Email reminder sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending email reminder', error: error.message });
  }
};