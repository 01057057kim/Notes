const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const passport = require('passport');
require('dotenv').config();

const setupMiddlewares = (app) => {
    app.use(cors({ credentials: true, origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
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
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            domain: process.env.NODE_ENV === 'production' ? 'notenest-jt3o.onrender.com' : undefined
        }
    }));

    app.use(passport.initialize());
    app.use(passport.session());
    
    require('../config/passport')(passport);
};

module.exports = setupMiddlewares;