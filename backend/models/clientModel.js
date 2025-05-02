const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
  },
  feeAmount: {
    type: Number,
    required: [true, 'Please add fee amount']
  },
  feeDueDate: {
    type: Date,
    required: [true, 'Please add fee due date'],
  },
  paymentSlot: {
    type: String,
    enum: ['slot1', 'slot2', 'slot3'],
    required: [true, 'Please select a payment slot']
  },
  // Fields for automated reminders
  lastReminderSent: {
    type: Date,
    default: null
  },
  reminderHistory: [{
    sentAt: {
      type: Date,
      required: true
    },
    type: {
      type: String,
      enum: ['automated', 'manual'],
      required: true
    },
    status: {
      type: String,
      enum: ['sent', 'failed'],
      required: true
    },
    messageId: String,
    error: String
  }],
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending'
  },
  lastPaymentDate: {
    type: Date,
    default: null
  },
  paymentHistory: [{
    amount: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    method: String,
    reference: String
  }],
  // Notification preferences
  reminderPreferences: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  membershipStatus: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended'],
    default: 'Active'
  }
}, {
  timestamps: true
});

// Add index for efficient queries
clientSchema.index({ paymentSlot: 1, feeDueDate: 1, status: 1 });

// Method to update reminder history
clientSchema.methods.addReminderHistory = async function(reminderDetails) {
  this.lastReminderSent = new Date();
  this.reminderHistory.push({
    sentAt: new Date(),
    ...reminderDetails
  });
  await this.save();
};

// Method to update payment status
clientSchema.methods.updatePaymentStatus = async function(paymentDetails) {
  this.paymentStatus = 'paid';
  this.lastPaymentDate = new Date();
  this.paymentHistory.push({
    date: new Date(),
    ...paymentDetails
  });
  await this.save();
};

// Pre-save hook to check and update payment status
clientSchema.pre('save', function(next) {
  if (this.lastPaymentDate) {
    const lastPaymentMonth = this.lastPaymentDate.getMonth();
    const currentMonth = new Date().getMonth();
    
    if (lastPaymentMonth !== currentMonth) {
      this.paymentStatus = 'pending';
    }
  }
  next();
});

// Virtual property to determine if reminders should be sent
// This is based on membership status
clientSchema.virtual('shouldReceiveReminders').get(function() {
  return this.membershipStatus === 'Active';
});

// When converting to JSON, include virtuals
clientSchema.set('toJSON', { virtuals: true });
clientSchema.set('toObject', { virtuals: true });

const Client = mongoose.model("Client", clientSchema);

module.exports = Client;