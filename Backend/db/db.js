const mongoose = require('mongoose');

let accountDB;
let categoryDB;
let notesDB;

const connectDB = () => {
    if (!accountDB || !categoryDB || !notesDB) {
        accountDB = mongoose.createConnection('mongodb://localhost:27017/account');
        categoryDB = mongoose.createConnection('mongodb://localhost:27017/category');
        notesDB = mongoose.createConnection('mongodb://localhost:27017/notes')

        accountDB.on('connected', () => console.log('Connected to account database'));
        categoryDB.on('connected', () => console.log('Connected to category database'));
        notesDB.on('connected', () => console.log('Connected to notes database'));

        accountDB.on('error', (err) => console.error('Failed to connect to account database:', err));
        categoryDB.on('error', (err) => console.error('Failed to connect to category database:', err));
        notesDB.on('error', (err) => console.error('Failed to connect to notes database:', err));
    }

    return { accountDB, categoryDB, notesDB };
};

module.exports = connectDB;
