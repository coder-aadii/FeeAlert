const Client = require('../models/clientModel');
const sendEmail = require('../utils/sendEmail');

exports.sendEmailReminder = async (req, res) => {
  // console.log('\n📧 Email Reminder Process Started');
  // console.log('Request Body:', req.body);
  
  try {
    const { clientIds, message, subject = 'Fee Payment Reminder', dueDate, paymentSlot } = req.body;

    if (!clientIds || !Array.isArray(clientIds) || clientIds.length === 0) {
      // console.log('❌ Error: No clients selected');
      return res.status(400).json({ success: false, message: 'No clients selected' });
    }

    if (!message) {
      // console.log('❌ Error: No message provided');
      return res.status(400).json({ success: false, message: 'Email message is required' });
    }

    // console.log(`📋 Processing ${clientIds.length} clients`);
    // console.log('Message:', message);
    // console.log('Subject:', subject);

    const results = {
      success: [],
      failed: []
    };

    // Get payment period based on slot
    const getPaymentPeriod = (slot) => {
      if (!slot) return '';
      switch(slot) {
        case 'slot1': return '1st - 5th';
        case 'slot2': return '15th - 20th';
        case 'slot3': return '25th - 30th';
        default: return 'scheduled date';
      }
    };

    // Process each client
    for (const clientId of clientIds) {
      // console.log(`\n🔄 Processing client ID: ${clientId}`);
      
      try {
        if (!clientId) {
          // console.log('❌ Invalid client ID');
          results.failed.push({ clientId, reason: 'Invalid client ID' });
          continue;
        }

        const client = await Client.findById(clientId);
        
        if (!client) {
          // console.log(`❌ Client not found: ${clientId}`);
          results.failed.push({ clientId, reason: 'Client not found' });
          continue;
        }

        if (!client.email) {
          // console.log(`❌ Client ${clientId} has no email address`);
          results.failed.push({ 
            clientId, 
            name: client.name, 
            reason: 'No email address' 
          });
          continue;
        }

        // console.log(`📨 Sending email to: ${client.email} (${client.name})`);

        // Create HTML content for email
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Fee Payment Reminder</h2>
            <p>Dear ${client.name},</p>
            
            <p>${message}</p>
            
            ${dueDate || paymentSlot ? `
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #2c3e50; margin-top: 0;">Payment Details</h3>
              ${paymentSlot ? `<p><strong>Payment Period:</strong> ${getPaymentPeriod(paymentSlot)}</p>` : ''}
              ${dueDate ? `<p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>` : ''}
              ${client.feeAmount ? `<p><strong>Amount:</strong> $${client.feeAmount}</p>` : ''}
            </div>
            ` : ''}
            
            <p>Please ensure timely payment to avoid any inconvenience.</p>
            
            <p style="margin-top: 20px;">Best regards,<br>FeeAlert Team</p>
          </div>
        `;

        // Prepare plain text version as fallback
        const textContent = `Dear ${client.name},\n\n${message}\n\n${
          dueDate || paymentSlot ? `Payment Details:\n${
            paymentSlot ? `Payment Period: ${getPaymentPeriod(paymentSlot)}\n` : ''
          }${dueDate ? `Due Date: ${new Date(dueDate).toLocaleDateString()}\n` : ''}${
            client.feeAmount ? `Amount: $${client.feeAmount}\n` : ''
          }\n` : ''
        }Please ensure timely payment to avoid any inconvenience.\n\nBest regards,\nFeeAlert Team`;

        // Send email
        await sendEmail({
          to: client.email,
          subject,
          text: textContent,
          html: htmlContent
        });

        // console.log(`✅ Email sent successfully to: ${client.email}`);
        results.success.push({ clientId, email: client.email, name: client.name });
      } catch (error) {
        console.error(`❌ Error processing client ${clientId}:`, error);
        
        // Get client info safely if it exists
        const clientInfo = {
          clientId,
          reason: error.message
        };
        
        // Only add these properties if client was found
        if (typeof client !== 'undefined') {
          if (client?.email) clientInfo.email = client.email;
          if (client?.name) clientInfo.name = client.name;
        }
        
        results.failed.push(clientInfo);
      }
    }

    // console.log('\n📊 Final Results:');
    // console.log('Successful:', results.success.length);
    // console.log('Failed:', results.failed.length);

    // Return response with results
    return res.status(200).json({ 
      success: true,
      message: 'Email reminders processed',
      results: {
        successCount: results.success.length,
        failureCount: results.failed.length,
        successfulEmails: results.success,
        failedEmails: results.failed
      }
    });

  } catch (error) {
    console.error('❌ Fatal Error in sendEmailReminder:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error processing email reminders', 
      error: error.message 
    });
  }
};

// Single client email reminder
exports.sendSingleEmailReminder = async (req, res) => {
  // console.log('\n📧 Single Email Reminder Process Started');
  // console.log('Client ID:', req.params.clientId);
  
  try {
    const { clientId } = req.params;
    
    if (!clientId) {
      // console.log('❌ No client ID provided');
      return res.status(400).json({ success: false, message: 'Client ID is required' });
    }
    
    const client = await Client.findById(clientId);

    if (!client) {
      // console.log(`❌ Client not found: ${clientId}`);
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    if (!client.email) {
      // console.log(`❌ Client ${clientId} has no email address`);
      return res.status(400).json({ success: false, message: 'Client has no email address' });
    }

    if (!client.feeAmount) {
      // console.log(`❌ Client ${clientId} missing fee amount`);
      return res.status(400).json({ success: false, message: 'Client missing fee amount' });
    }
    
    if (!client.dueDate) {
      // console.log(`❌ Client ${clientId} missing due date`);
      return res.status(400).json({ success: false, message: 'Client missing due date' });
    }

    try {
      // console.log(`📨 Sending email to: ${client.email} (${client.name})`);
      // console.log(`Payment details: $${client.feeAmount} due on ${client.dueDate}`);
      
      // Create HTML content for email
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Fee Payment Reminder</h2>
          <p>Dear ${client.name},</p>
          
          <p>This is a reminder about your upcoming payment.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #2c3e50; margin-top: 0;">Payment Details</h3>
            <p><strong>Amount:</strong> $${client.feeAmount}</p>
            <p><strong>Due Date:</strong> ${new Date(client.dueDate).toLocaleDateString()}</p>
          </div>
          
          <p>Please ensure timely payment to avoid any inconvenience.</p>
          
          <p style="margin-top: 20px;">Best regards,<br>FeeAlert Team</p>
        </div>
      `;

      // Plain text version as fallback
      const textContent = `Dear ${client.name},\n\nThis is a reminder that your payment of $${client.feeAmount} is due on ${new Date(client.dueDate).toLocaleDateString()}.\n\nPlease ensure timely payment to avoid any inconvenience.\n\nBest regards,\nFeeAlert Team`;
      
      await sendEmail({
        to: client.email,
        subject: 'Fee Payment Reminder',
        text: textContent,
        html: htmlContent
      });
      
      // console.log(`✅ Email sent successfully to: ${client.email}`);
    } catch (emailError) {
      console.error(`❌ Failed to send email to ${client.email}:`, emailError);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send email', 
        error: emailError.message 
      });
    }

    // console.log(`✅ Email sent successfully to: ${client.email}`);
    return res.status(200).json({ 
      success: true, 
      message: 'Email reminder sent successfully',
      client: {
        id: client._id,
        name: client.name,
        email: client.email
      }
    });
  } catch (error) {
    console.error('❌ Error in sendSingleEmailReminder:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error sending email reminder', 
      error: error.message 
    });
  }
};