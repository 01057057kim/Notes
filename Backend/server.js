const express = require('express');
const setupMiddlewares = require('./middlewares/middlewares');
const connectDB = require('./db/db');

const accountRoutes = require('./routes/routesAccount');
const categoryRoutes = require('./routes/routesCategory');
const notesRoutes = require('./routes/routesNotes')

const port = 3000;
const app = express();

setupMiddlewares(app);

const { accountDB, categoryDB, notesDB } = connectDB();

app.use('/account', accountRoutes);
app.use('/category', categoryRoutes);
app.use('/notes', notesRoutes)


app.listen(port, () => {
    console.log('server online')
})