const express = require('express');
const router = express.Router();
const { signUp, signIn, signOut, getUsername } = require('../controllers/controllerAccount');

router.post('/signup', signUp);

router.post('/signin', signIn);

router.post('/signout', signOut);

router.get('/getusername', getUsername);

module.exports = router;