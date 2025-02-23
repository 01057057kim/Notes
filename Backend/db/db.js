const mongoose = require('mongoose');

let accountDB;
let categoryDB;

const connectDB = () => {
    if (!accountDB || !categoryDB) {
        accountDB = mongoose.createConnection('mongodb://localhost:27017/account');
        categoryDB = mongoose.createConnection('mongodb://localhost:27017/category');

        accountDB.on('connected', () => console.log('Connected to account database'));
        categoryDB.on('connected', () => console.log('Connected to category database'));

        accountDB.on('error', (err) => console.error('Failed to connect to account database:', err));
        categoryDB.on('error', (err) => console.error('Failed to connect to category database:', err));
    }

    return { accountDB, categoryDB };
};

module.exports = connectDB;
