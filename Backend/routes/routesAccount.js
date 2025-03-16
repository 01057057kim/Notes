const express = require('express');
const router = express.Router();
const passport = require('passport');
const { signUp, signIn, signOut, getUsername } = require('../controllers/controllerAccount');
const accountController = require('../controllers/controllerAccount');

router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/signout', signOut);
router.get('/getusername', getUsername);
router.get('/google', accountController.googleAuth);
router.get('/google/callback', accountController.googleCallback);
router.post('/verify', accountController.verifyEmail);
router.post('/resend-verification', accountController.resendVerificationCode);
module.exports = router;