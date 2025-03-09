const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express();

const setupMiddlewares = (app) => {
    app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
    app.use(express.json());
    app.use(bodyParser.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname, '../../Frontend/src')));
    app.use(express.static(path.join(__dirname, '../../Frontend/src/img')));
    app.use(express.static(path.join(__dirname, '../../Frontend/src/js')));
    app.use(session({
        secret: 'secret',
        resave: false,
        saveUninitialized: true,
        cookie: {secure: false}
    }
    ))
}

module.exports = setupMiddlewares;