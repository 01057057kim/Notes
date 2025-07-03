const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const passport = require('passport');
require('dotenv').config();

const setupMiddlewares = (app) => {
    // CORS configuration for production
    const allowedOrigins = [
        'http://localhost:3000',
        'https://notenest-pm5q.onrender.com'
    ];
    
    app.use(cors({ 
        credentials: true, 
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        }
    }));
    
    app.use(express.json());
    app.use(bodyParser.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname, '../../Frontend/src')));
    app.use(express.static(path.join(__dirname, '../../Frontend/src/img')));
    app.use(express.static(path.join(__dirname, '../../Frontend/src/js')));
    app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        }
    }));

    app.use(passport.initialize());
    app.use(passport.session());
    
    require('../config/passport')(passport);
};

module.exports = setupMiddlewares;