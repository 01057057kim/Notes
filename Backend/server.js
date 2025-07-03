const express = require('express');
const path = require('path');
const setupMiddlewares = require('./middlewares/middlewares');
const connectDB = require('./db/db');
require('dotenv').config();
const passport = require('passport');

const accountRoutes = require('./routes/routesAccount');
const categoryRoutes = require('./routes/routesCategory');
const notesRoutes = require('./routes/routesNotes')
const imageRoutes = require('./routes/routesImage')
const todoRoutes = require('./routes/routesTodo')
const linkRoutes = require('./routes/routesLink')

const port = process.env.PORT || 3000;
const app = express();

setupMiddlewares(app);

const { accountDB, categoryDB, notesDB, imageDB, todoDB, linkdB ,verifyDB } = connectDB();

app.use('/account', accountRoutes);
app.use('/category', categoryRoutes);
app.use('/notes', notesRoutes)
app.use('/image', imageRoutes)
app.use('/todo', todoRoutes)
app.use('/link', linkRoutes)

app.use(passport.initialize());
app.use(passport.session());

// Serve static files for production
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/src/index.html'));
});

if (process.env.NODE_ENV !== 'production' || process.env.DEBUG_ENV === 'true') {
  app.get('/debug-env', (req, res) => {
    // Only show non-sensitive envs
    const safeEnv = {};
    Object.keys(process.env).forEach(key => {
      if (!/SECRET|PASSWORD|MONGODB|EMAIL|KEY/i.test(key)) {
        safeEnv[key] = process.env[key];
      }
    });
    res.json(safeEnv);
  });
}

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})