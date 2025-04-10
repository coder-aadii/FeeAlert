const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  feeDueDate: {
    type: Date,
    required: true,
  },
  membershipStatus: {
    type: String,
    enum: ["active", "inactive", "suspended"],
    default: "active",
  },
  phone: {
    type: String,
    required: true,
  },
});

const Client = mongoose.model("Client", clientSchema);

module.exports = Client;
