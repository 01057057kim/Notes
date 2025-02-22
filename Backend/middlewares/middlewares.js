const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();

const setupMiddlewares = (app) => {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname, '../../Frontend/src')));

    app.use(session({
        secret: 'secret',
        resave: false,
        saveUninitialized: false,
        cookie: {secure: false}
    }
    ))
}

module.exports = setupMiddlewares;