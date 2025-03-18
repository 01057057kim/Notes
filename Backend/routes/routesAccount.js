const express = require('express');
const router = express.Router();
const passport = require('passport');
const accountController = require('../controllers/controllerAccount');

router.post('/signup', accountController.signUp);
router.post('/signin', accountController.signIn);
router.post('/signout', accountController.signOut);
router.get('/getusername', accountController.getUsername);
router.get('/getusernameverified', accountController.getUsernameVerified);
router.get('/google', accountController.googleAuth);
router.get('/google/callback', accountController.googleCallback);
router.post('/verify', accountController.verifyEmail);
router.post('/resend-verification', accountController.resendVerificationCode);
router.post('/forget-password', accountController.requestPasswordReset);
router.post('/reset-password', accountController.resetPassword);

module.exports = router;