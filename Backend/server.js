const express = require('express');
const setupMiddlewares = require('./middlewares/middlewares');
const connectDB = require('./db/db');
const passport = require('passport');

const accountRoutes = require('./routes/routesAccount');
const categoryRoutes = require('./routes/routesCategory');
const notesRoutes = require('./routes/routesNotes')
const imageRoutes = require('./routes/routesImage')

const port = 3000;
const app = express();

setupMiddlewares(app);

const { accountDB, categoryDB, notesDB, imageDB, verifyDB } = connectDB();

app.use('/account', accountRoutes);
app.use('/category', categoryRoutes);
app.use('/notes', notesRoutes)
app.use('/image', imageRoutes)
app.use(passport.initialize());
app.use(passport.session());

app.listen(port, () => {
    console.log('server online')
})