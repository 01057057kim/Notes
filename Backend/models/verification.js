const mongoose = require('mongoose');
const connectDB = require('../db/db');

const { verifyDB } = connectDB();

const verificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 //deleted after 10 minutes 
  }
});

module.exports = verifyDB.model('Verification', verificationSchema);