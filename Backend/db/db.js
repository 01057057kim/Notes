const mongoose = require('mongoose');
require('dotenv').config();
let accountDB, categoryDB, notesDB, imageDB, todoDB, linkdB, verifyDB;

const connectDB = () => {
    // Use MongoDB Atlas URI from environment variable, fallback to local if not set
    const mongoHost = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    
    // MongoDB Atlas connection options
    const connectionOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    };
    
    if (!accountDB || !categoryDB || !notesDB || !imageDB || !todoDB || !verifyDB) {
        // Get database names from environment variables or use defaults
        const accountDbName = process.env.ACCOUNT_DB || 'account';
        const categoryDbName = process.env.CATEGORY_DB || 'category';
        const notesDbName = process.env.NOTES_DB || 'notes';
        const imageDbName = process.env.IMAGE_DB || 'image';
        const todoDbName = process.env.TODO_DB || 'todo';
        const linkDbName = process.env.LINK_DB || 'link';
        const verificationDbName = process.env.VERIFICATION_DB || 'verification';

        // Create connections using the Atlas URI with database names
        // For MongoDB Atlas, we need to append the database name with a slash
        accountDB = mongoose.createConnection(`${mongoHost}${accountDbName}`, connectionOptions);
        categoryDB = mongoose.createConnection(`${mongoHost}${categoryDbName}`, connectionOptions);
        notesDB = mongoose.createConnection(`${mongoHost}${notesDbName}`, connectionOptions);
        imageDB = mongoose.createConnection(`${mongoHost}${imageDbName}`, connectionOptions);
        todoDB = mongoose.createConnection(`${mongoHost}${todoDbName}`, connectionOptions);
        linkdB = mongoose.createConnection(`${mongoHost}${linkDbName}`, connectionOptions);
        verifyDB = mongoose.createConnection(`${mongoHost}${verificationDbName}`, connectionOptions);

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