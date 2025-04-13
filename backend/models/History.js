const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['reminder', 'payment'],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  status: {
    type: String,
    enum: ['success', 'pending', 'failed'],
    default: 'pending',
    index: true
  },
  amount: {
    type: Number,
    required: function() {
      return this.type === 'payment';
    }
  },
  reminderType: {
    type: String,
    enum: ['sms', 'email', 'both'],
    required: function() {
      return this.type === 'reminder';
    }
  },
  clientDetails: {
    name: String,
    email: String,
    phone: String,
    feeDueDate: Date
  },
  metadata: {
    smsId: String,
    emailId: String,
    errorDetails: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Indexes for better search performance
historySchema.index({ 
  'clientDetails.name': 'text',
  'clientDetails.email': 'text',
  'clientDetails.phone': 'text',
  title: 'text',
  description: 'text'
});

// Pre-save middleware to ensure clientDetails are populated
historySchema.pre('save', async function(next) {
  if (!this.clientDetails || !this.clientDetails.name) {
    try {
      const Client = mongoose.model('Client');
      const client = await Client.findById(this.clientId);
      if (client) {
        this.clientDetails = {
          name: client.name,
          email: client.email,
          phone: client.phone,
          feeDueDate: client.feeDueDate
        };
      }
    } catch (error) {
      console.error('Error in history pre-save:', error);
    }
  }
  next();
});

module.exports = mongoose.model('History', historySchema);
