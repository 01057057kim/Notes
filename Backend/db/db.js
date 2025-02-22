const mongoose = require('mongoose');

const connect = () => {
    mongoose.connect('mongodb://localhost:27017/account', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log('Database connected');
    })
    .catch((err) => {
        console.log('Database connection failed db.js', err);
    })
}

module.exports = connect;