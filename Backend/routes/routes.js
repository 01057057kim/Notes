const express = require('express');
const router = express.Router();
const path = require('path');
const { signUp, signIn, signOut } = require('../controllers/controllers');

router.post('/signup', signUp);

router.post('/signin', signIn);

router.post('/signout', signOut);

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'../../Frontend/src/index.html'));
});

module.exports = router;