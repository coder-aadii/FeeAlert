const cron = require('node-cron');
const Client = require('../models/clientModel');
const sendEmail = require('./sendEmail');
const { createReminderHistory } = require('../controllers/reminderController');

// Function to get slot details based on day of month
const getSlotDetails = (day) => {
  // Only return slot details during payment windows
  if (day >= 1 && day <= 5) {
    return {
      slot: 'slot1',
      paymentPeriod: '1st - 5th',
      duePeriod: '1st - 10th'
    };
  } else if (day >= 15 && day <= 20) {
    return {
      slot: 'slot2',
      paymentPeriod: '15th - 20th',
      duePeriod: '11th - 20th'
    };
  } else if (day >= 25 && day <= 30) {
    return {
      slot: 'slot3',
      paymentPeriod: '25th - 30th',
      duePeriod: '21st - 31st'
    };
  }
  return null;
};

// Function to send reminder emails for a specific slot
const sendSlotReminders = async () => {
  const today = new Date();
  const day = today.getDate();
  
  console.log(`\n📅 Current date: ${today.toLocaleDateString()}`);
  console.log(`📅 Current day: ${day}`);
  
  // Check if today is within any payment window
  const slotDetails = getSlotDetails(day);
  if (!slotDetails) {
    console.log('❌ Today is not a payment day for any slot. No reminders will be sent.');
    return;
  }

  console.log(`\n📧 Starting Automated Reminders for ${slotDetails.paymentPeriod}`);
  console.log(`🎯 Active Slot: ${slotDetails.slot}`);
  console.log(`⏰ Payment Period: ${slotDetails.paymentPeriod}`);
  console.log(`📅 Due Period: ${slotDetails.duePeriod}`);

  try {
    // Find clients with due dates in this slot
    const clients = await Client.find({
      feeDueDate: {
        $exists: true,
        $ne: null
      }
    });

    const slotClients = clients.filter(client => {
      const clientDueDay = new Date(client.feeDueDate).getDate();
      if (slotDetails.slot === 'slot1') return clientDueDay >= 1 && clientDueDay <= 10;
      if (slotDetails.slot === 'slot2') return clientDueDay >= 11 && clientDueDay <= 20;
      if (slotDetails.slot === 'slot3') return clientDueDay >= 21 && clientDueDay <= 31;
      return false;
    });

    console.log(`Found ${slotClients.length} clients for ${slotDetails.paymentPeriod}`);

    for (const client of slotClients) {
      try {
        const dueDate = new Date(client.feeDueDate);
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Fee Payment Reminder</h2>
            <p>Dear ${client.name},</p>
            
            <p>This is a reminder that your fee payment window is currently open.</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #2c3e50; margin-top: 0;">Payment Details</h3>
              <p><strong>Payment Window:</strong> ${slotDetails.paymentPeriod} of this month</p>
              <p><strong>Due Date:</strong> ${dueDate.toLocaleDateString()}</p>
              ${client.feeAmount ? `<p><strong>Amount:</strong> $${client.feeAmount}</p>` : ''}
            </div>
            
            <p style="color: #e74c3c;"><strong>Important:</strong> Please ensure to make the payment within the current payment window (${slotDetails.paymentPeriod}) to avoid any late fee charges.</p>

            <p style="color: #666; font-style: italic;">If you have already made the payment, please disregard this reminder and accept our thanks.</p>
            
            <p style="margin-top: 20px;">Best regards,<br>FeeAlert Team</p>

            <div style="color: #666; font-size: 12px; margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee;">
              <p>This is an automated reminder. Please do not reply to this email.</p>
              <p>For any queries, please contact our support team.</p>
            </div>
          </div>
        `;

        const textContent = `
Dear ${client.name},

This is a reminder that your fee payment window is currently open.

Payment Details:
- Payment Window: ${slotDetails.paymentPeriod} of this month
- Due Date: ${dueDate.toLocaleDateString()}
${client.feeAmount ? `- Amount: $${client.feeAmount}` : ''}

IMPORTANT: Please ensure to make the payment within the current payment window (${slotDetails.paymentPeriod}) to avoid any late fee charges.

If you have already made the payment, please disregard this reminder and accept our thanks.

Best regards,
FeeAlert Team

---
This is an automated reminder. Please do not reply to this email.
For any queries, please contact our support team.
        `;

        const emailResult = await sendEmail({
          to: client.email,
          subject: 'Fee Payment Window Open - Action Required',
          text: textContent,
          html: htmlContent
        });

        console.log(`✅ Reminder sent to ${client.email}`);
        
        // Create history entry for the reminder
        const status = 'success';
        const description = `Automated reminder sent for ${slotDetails.paymentPeriod} payment window`;
        const metadata = {
          emailId: emailResult?.messageId || null,
          slotDetails: slotDetails,
          paymentPeriod: slotDetails.paymentPeriod,
          duePeriod: slotDetails.duePeriod
        };
        
        await createReminderHistory(
          client._id, // Using client ID as reference
          client,
          'email',
          status,
          description,
          metadata
        );
      } catch (error) {
        console.error(`❌ Failed to send reminder to ${client.email}:`, error);
        
        // Create history entry for failed reminder
        const status = 'failed';
        const description = `Failed to send automated reminder: ${error.message}`;
        const metadata = {
          errorDetails: error.message,
          slotDetails: slotDetails,
          paymentPeriod: slotDetails.paymentPeriod,
          duePeriod: slotDetails.duePeriod
        };
        
        try {
          await createReminderHistory(
            client._id,
            client,
            'email',
            status,
            description,
            metadata
          );
        } catch (historyError) {
          console.error(`❌ Failed to create reminder history for ${client.email}:`, historyError);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error in automated reminders:', error);
  }
};

// Schedule reminders to run at 10:00 AM every day
const scheduleReminders = () => {
  // Runs at 10:00 AM every day
  cron.schedule('0 10 * * *', async () => {
    await sendSlotReminders();
  });

  console.log('📅 Automated reminders scheduled for 10:00 AM daily');
};

module.exports = { 
  scheduleReminders,
  sendSlotReminders // Export for testing
};
