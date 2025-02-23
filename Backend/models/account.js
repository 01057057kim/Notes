const mongoose = require('mongoose');
const connectDB = require('../db/db');

const { accountDB } = connectDB();

const accountSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },

});

const Account = accountDB.model('Account', accountSchema);
module.exports = Account;