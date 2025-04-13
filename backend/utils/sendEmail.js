const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  console.log('\n📧 Starting Email Configuration');
  console.log('Email Settings:', {
    service: 'gmail',
    user: process.env.EMAIL_USER ? process.env.EMAIL_USER.substring(0, 5) + '...' : 'NOT SET', // Hide most of email
    pass: process.env.EMAIL_PASS ? '****' : 'NOT SET' // Hide actual password
  });

  try {
    // Create transporter with Gmail-specific settings
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    console.log('📨 Testing transporter connection...');
    
    // Verify connection configuration
    await transporter.verify();
    console.log('✅ Transporter connection verified successfully');

    console.log('📧 Attempting to send email:', {
      from: `${process.env.EMAIL_FROM_NAME || 'Notification'} <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject
    });

    // Send email
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Notification'}" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html // HTML support maintained
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    return info;

  } catch (error) {
    console.error('❌ Error in sendEmail:', error);
    if (error.code === 'EAUTH') {
      console.error('Authentication Error Details:', {
        code: error.code,
        response: error.response,
        responseCode: error.responseCode,
        command: error.command
      });
    }
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = sendEmail;
