const mongoose = require('mongoose');
require('dotenv').config();
let accountDB, categoryDB, notesDB, imageDB, todoDB, linkdB, verifyDB;

const connectDB = () => {
    const mongoHost = process.env.MONGO_URI || 'mongodb://localhost:27017';
    
    if (!accountDB || !categoryDB || !notesDB || !imageDB || !todoDB || !verifyDB) {
        accountDB = mongoose.createConnection(`${mongoHost}/account`);
        categoryDB = mongoose.createConnection(`${mongoHost}/category`);
        notesDB = mongoose.createConnection(`${mongoHost}/notes`);
        imageDB = mongoose.createConnection(`${mongoHost}/image`);
        todoDB = mongoose.createConnection(`${mongoHost}/todo`);
        linkdB = mongoose.createConnection(`${mongoHost}/link`);
        verifyDB = mongoose.createConnection(`${mongoHost}/verification`);

        accountDB.on('connected', () => console.log('Connected to account database'));
        categoryDB.on('connected', () => console.log('Connected to category database'));
        notesDB.on('connected', () => console.log('Connected to notes database'));
        imageDB.on('connected', () => console.log('Connected to image database'));
        todoDB.on('connected', () => console.log('Connected to todo database'));
        linkdB.on('connected', () => console.log('Connected to link database'));
        verifyDB.on('connected', () => console.log('Connected to verification database'));

        accountDB.on('error', (err) => console.error('Failed to connect to account database:', err));
        categoryDB.on('error', (err) => console.error('Failed to connect to category database:', err));
        notesDB.on('error', (err) => console.error('Failed to connect to notes database:', err));
        imageDB.on('error', (err) => console.error('Failed to connect to image database:', err));
        todoDB.on('error', (err) => console.error('Failed to connect to todo database:', err));
        linkdB.on('error', (err) => console.error('Failed to connect to link database:', err));
        verifyDB.on('error', (err) => console.error('Failed to connect to verification database', err));
    }

    return { accountDB, categoryDB, notesDB, imageDB, todoDB, linkdB, verifyDB};
};

module.exports = connectDB;