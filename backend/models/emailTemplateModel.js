const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Template name is required'],
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Email subject is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Email content is required']
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Ensure only one default template
emailTemplateSchema.pre('save', async function(next) {
  if (this.isDefault) {
    // If this template is being set as default, unset any other defaults
    await this.constructor.updateMany(
      { _id: { $ne: this._id }, isDefault: true },
      { $set: { isDefault: false } }
    );
  }
  next();
});

const EmailTemplate = mongoose.model('EmailTemplate', emailTemplateSchema);

// Create default template if none exists
const createDefaultTemplate = async () => {
  const count = await EmailTemplate.countDocuments();
  if (count === 0) {
    await EmailTemplate.create({
      name: 'Default Payment Reminder',
      subject: 'Payment Reminder: Your Fee is Due Soon',
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Payment Reminder</h2>
          <p>Dear {{clientName}},</p>
          <p>This is a friendly reminder that your payment of <strong>₹{{feeAmount}}</strong> is due on <strong>{{dueDate}}</strong>.</p>
          <p>Please ensure timely payment to avoid any interruption in services.</p>
          <p>If you have already made the payment, please disregard this message.</p>
          <p>Thank you for your cooperation.</p>
          <p style="margin-top: 20px;">Best regards,<br>Fee Alert System</p>
        </div>
      `,
      isDefault: true
    });
    console.log('Default email template created');
  }
};

// Call this function when the application starts
createDefaultTemplate().catch(err => console.error('Error creating default template:', err));

module.exports = EmailTemplate;