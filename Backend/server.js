const express = require('express');
const router = require('./routes/routes');
const setupMiddlewares = require('./middlewares/middlewares');
const database = require('./db/db');

const port = 3000;

const app = express();

setupMiddlewares(app);

database();

app.use('/', router);

app.listen(port, () => {
    console.log('server online')
})