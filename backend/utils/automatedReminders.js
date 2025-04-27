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
  
  // console.log(`\n📅 Current date: ${today.toLocaleDateString()}`);
  // console.log(`📅 Current day: ${day}`);
  
  // Check if today is within any payment window
  const slotDetails = getSlotDetails(day);
  if (!slotDetails) {
    // console.log('❌ Today is not a payment day for any slot. No reminders will be sent.');
    return;
  }

  // console.log(`\n📧 Starting Automated Reminders for ${slotDetails.paymentPeriod}`);
  // console.log(`🎯 Active Slot: ${slotDetails.slot}`);
  // console.log(`⏰ Payment Period: ${slotDetails.paymentPeriod}`);
  // console.log(`📅 Due Period: ${slotDetails.duePeriod}`);

  try {
    // Find clients with due dates in this slot AND active membership status
    const clients = await Client.find({
      feeDueDate: {
        $exists: true,
        $ne: null
      },
      membershipStatus: 'Active' // Only send reminders to active clients
    });

    const slotClients = clients.filter(client => {
      const clientDueDay = new Date(client.feeDueDate).getDate();
      if (slotDetails.slot === 'slot1') return clientDueDay >= 1 && clientDueDay <= 10;
      if (slotDetails.slot === 'slot2') return clientDueDay >= 11 && clientDueDay <= 20;
      if (slotDetails.slot === 'slot3') return clientDueDay >= 21 && clientDueDay <= 31;
      return false;
    });

    // console.log(`Found ${slotClients.length} active clients for ${slotDetails.paymentPeriod}`);

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

        // console.log(`✅ Reminder sent to ${client.email}`);
        
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
        // console.error(`❌ Failed to send reminder to ${client.email}:`, error);
        
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
          // console.error(`❌ Failed to create reminder history for ${client.email}:`, historyError);
        }
      }
    }
  } catch (error) {
    // console.error('❌ Error in automated reminders:', error);
  }
};

// Function to send reminders based on days before due date
const sendPreDueReminders = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Define reminder intervals (days before due date)
  const reminderIntervals = [
    { days: 7, type: 'email', subject: 'Upcoming Fee Payment - 7 Days Reminder' },
    { days: 3, type: 'email', subject: 'Important: Fee Payment Due in 3 Days' },
    { days: 1, type: 'email', subject: 'URGENT: Fee Payment Due Tomorrow' }
  ];
  
  try {
    // Find all active clients with due dates
    const clients = await Client.find({
      feeDueDate: { $exists: true, $ne: null },
      membershipStatus: 'Active' // Only send reminders to active clients
    });
    
    // console.log(`Found ${clients.length} active clients with due dates`);
    
    for (const client of clients) {
      try {
        if (!client.feeDueDate) continue;
        
        const dueDate = new Date(client.feeDueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        // Skip if due date is in the past
        if (dueDate < today) continue;
        
        // Calculate days until due date
        const daysUntilDue = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
        
        // Check if we need to send a reminder today based on our intervals
        const matchingInterval = reminderIntervals.find(interval => interval.days === daysUntilDue);
        
        if (matchingInterval) {
          // console.log(`Sending ${daysUntilDue}-day reminder to ${client.name} (${client._id})`);
          
          // Generate email content based on urgency
          const isUrgent = daysUntilDue <= 3;
          
          const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: ${isUrgent ? '#e74c3c' : '#2c3e50'};">Fee Payment Reminder</h2>
              <p>Dear ${client.name},</p>
              
              <p>${isUrgent ? '<strong>IMPORTANT:</strong> ' : ''}This is a reminder that your fee payment is due ${daysUntilDue === 1 ? 'tomorrow' : `in ${daysUntilDue} days`}.</p>
              
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="color: #2c3e50; margin-top: 0;">Payment Details</h3>
                <p><strong>Due Date:</strong> ${dueDate.toLocaleDateString()}</p>
                <p><strong>Days Remaining:</strong> ${daysUntilDue}</p>
                ${client.feeAmount ? `<p><strong>Amount:</strong> $${client.feeAmount}</p>` : ''}
              </div>
              
              ${isUrgent ? `<p style="color: #e74c3c;"><strong>Urgent Action Required:</strong> Please ensure your payment is made before the due date to avoid any late fees or service interruptions.</p>` : ''}

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

${isUrgent ? 'IMPORTANT: ' : ''}This is a reminder that your fee payment is due ${daysUntilDue === 1 ? 'tomorrow' : `in ${daysUntilDue} days`}.

Payment Details:
- Due Date: ${dueDate.toLocaleDateString()}
- Days Remaining: ${daysUntilDue}
${client.feeAmount ? `- Amount: $${client.feeAmount}` : ''}

${isUrgent ? 'URGENT ACTION REQUIRED: Please ensure your payment is made before the due date to avoid any late fees or service interruptions.' : ''}

If you have already made the payment, please disregard this reminder and accept our thanks.

Best regards,
FeeAlert Team

---
This is an automated reminder. Please do not reply to this email.
For any queries, please contact our support team.
          `;

          const emailResult = await sendEmail({
            to: client.email,
            subject: matchingInterval.subject,
            text: textContent,
            html: htmlContent
          });
          
          // Create history entry for the reminder
          const status = 'success';
          const description = `Automated ${daysUntilDue}-day pre-due reminder sent`;
          const metadata = {
            emailId: emailResult?.messageId || null,
            daysBeforeDue: daysUntilDue,
            reminderType: 'pre-due'
          };
          
          await createReminderHistory(
            client._id,
            client,
            'email',
            status,
            description,
            metadata
          );
        }
      } catch (error) {
        // console.error(`❌ Failed to process pre-due reminder for client ${client._id}:`, error);
        
        // Create history entry for failed reminder
        const status = 'failed';
        const description = `Failed to send pre-due reminder: ${error.message}`;
        const metadata = {
          errorDetails: error.message,
          reminderType: 'pre-due'
        };
        
        try {
          await createReminderHistory(
            client._id,
            client,
            'email',
            status,
            'failed',
            metadata
          );
        } catch (historyError) {
          // console.error(`❌ Failed to create reminder history:`, historyError);
        }
      }
    }
  } catch (error) {
    // console.error('❌ Error in pre-due reminders:', error);
  }
};

// Schedule reminders to run at 10:00 AM every day
const scheduleReminders = () => {
  // Runs at 10:00 AM every day - slot-based reminders
  cron.schedule('0 10 * * *', async () => {
    await sendSlotReminders();
  });

  // Runs at 9:00 AM every day - pre-due date reminders
  cron.schedule('0 9 * * *', async () => {
    await sendPreDueReminders();
  });

  // console.log('📅 Automated reminders scheduled:');
  // console.log('- Slot-based reminders: 10:00 AM daily');
  // console.log('- Pre-due reminders: 9:00 AM daily');
};

module.exports = { 
  scheduleReminders,
  sendSlotReminders, // Export for testing
  sendPreDueReminders // Export for testing
};
