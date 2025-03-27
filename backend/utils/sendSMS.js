/*
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSMS = async ({ to, message }) => {
  try {
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });
    return true;
  } catch (error) {
    console.error('SMS sending error:', error);
    throw error;
  }
};
*/

// SMS functionality temporarily disabled
const sendSMS = async () => {
  throw new Error('SMS service is temporarily disabled');
};

module.exports = sendSMS;
