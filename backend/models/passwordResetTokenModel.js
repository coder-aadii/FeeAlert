const mongoose = require('mongoose');

const passwordResetTokenSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Admin'
  },
  token: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // Token expires after 1 hour
  }
});

module.exports = mongoose.model('PasswordResetToken', passwordResetTokenSchema);