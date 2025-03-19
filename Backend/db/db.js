const mongoose = require('mongoose');

let accountDB, categoryDB, notesDB, imageDB;

const connectDB = () => {
    if (!accountDB || !categoryDB || !notesDB) {
        accountDB = mongoose.createConnection('mongodb://localhost:27017/account');
        categoryDB = mongoose.createConnection('mongodb://localhost:27017/category');
        notesDB = mongoose.createConnection('mongodb://localhost:27017/notes')
        imageDB = mongoose.createConnection('mongodb://localhost:27017/image')
        verifyDB =  mongoose.createConnection('mongodb://localhost:27017/verification')

        accountDB.on('connected', () => console.log('Connected to account database'));
        categoryDB.on('connected', () => console.log('Connected to category database'));
        notesDB.on('connected', () => console.log('Connected to notes database'));
        imageDB.on('connected', () => console.log('Connected to image database'));
        verifyDB.on('connected', () => console.log('Connected to verification database'));

        accountDB.on('error', (err) => console.error('Failed to connect to account database:', err));
        categoryDB.on('error', (err) => console.error('Failed to connect to category database:', err));
        notesDB.on('error', (err) => console.error('Failed to connect to notes database:', err));
        imageDB.on('error', (err) => console.error('Failed to connect to image database:', err));
        verifyDB.on('error', (err) => console.error('Failed to connect to verification database', err));
    }

    return { accountDB, categoryDB, notesDB, imageDB, verifyDB};
};

module.exports = connectDB;
