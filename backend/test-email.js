require('dotenv').config();
const sendEmail = require('./utils/sendEmail');

const testEmail = async () => {
  try {
    console.log('Starting email test...');
    
    await sendEmail({
      to: 'adityaaerpule@gmail.com', // Your email to test
      subject: 'Test Email from FeeAlert',
      text: 'This is a test email to verify the email configuration.'
    });

    console.log('Test email sent successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testEmail();