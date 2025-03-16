const bcrypt = require('bcrypt');
const account = require('../models/account');
const passport = require('passport');
const verification = require('../models/verification');
const { sendVerificationEmail } = require('../config/email');
require('dotenv').config();

const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const signUp = async (req, res) => {
    try {
        const { username, email, password } = req.body
        const existingAccount = await account.findOne({ username });

        if (existingAccount) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered. Please use a different email or try logging in.'
            });
        }

        const existingEmail = await account.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        const hashEncoded = parseInt(process.env.BCRYPT_ROUND)
        const hash = await bcrypt.hash(password, hashEncoded);

        const newAccount = new account({
            username,
            email,
            password: hash,
            isVerified: false
        });

        const verificationCode = generateVerificationCode();
        const newVerification = new verification({
            email,
            code: verificationCode
        });

        await newVerification.save();

        const emailSent = await sendVerificationEmail(email, verificationCode);

        if (!emailSent) {
            return res.status(500).json({
                success: false,
                message: 'Failed to send verification email'
            });
        }

        await newAccount.save();
        console.log('Account created successfully');

        res.status(201).json({
            success: true,
            message: 'Account created! Please check your email for verification code',
            email
        });
    } catch (err) {
        console.error('Failed to create account:', err);
        res.status(500).json({
            success: false,
            message: 'Internal server error during signup'
        });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;

        const verificationRecord = await verification.findOne({ email, code });

        if (!verificationRecord) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification code'
            });
        }

        const updatedAccount = await account.findOneAndUpdate(
            { email },
            { isVerified: true },
            { new: true }
        );

        if (!updatedAccount) {
            return res.status(400).json({
                success: false,
                message: 'Account not found'
            });
        }

        await verification.deleteOne({ _id: verificationRecord._id });

        res.status(200).json({
            success: true,
            message: 'Email verified successfully! You can now log in.'
        });
    } catch (err) {
        console.error('Failed to verify email:', err);
        res.status(500).json({
            success: false,
            message: 'Error verifying email'
        });
    }
};

const signIn = async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingAccount = await account.findOne({ username });

        if (!existingAccount) {
            return res.status(400).json({
                success: false,
                message: 'Account does not exist'
            });
        }

        if (!existingAccount.isVerified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email before logging in'
            });
        }

        const hashDecoded = await bcrypt.compare(password, existingAccount.password);
        if (!hashDecoded) {
            return res.status(400).json({
                success: false,
                message: 'Invalid password'
            });
        }
        req.session.user = {
            username: existingAccount.username,
            id: existingAccount._id
        }
        res.status(200).json({
            success: true,
        });
    } catch (err) {
        console.error('Failed to signin:', err);
        res.status(500).json({
            success: false,
            message: 'error during signin'
        });
    }
}

const resendVerificationCode = async (req, res) => {
    try {
        const { email } = req.body;

        const existingAccount = await account.findOne({ email });

        if (!existingAccount) {
            return res.status(400).json({
                success: false,
                message: 'Account with this email does not exist'
            });
        }

        if (existingAccount.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'Account is already verified'
            });
        }

        await verification.deleteMany({ email });

        const verificationCode = generateVerificationCode();

        const newVerification = new verification({
            email,
            code: verificationCode
        });

        await newVerification.save();

        const emailSent = await sendVerificationEmail(email, verificationCode);

        if (!emailSent) {
            return res.status(500).json({
                success: false,
                message: 'Failed to send verification email'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Verification code sent! Please check your email'
        });
    } catch (err) {
        console.error('Failed to resend verification code:', err);
        res.status(500).json({
            success: false,
            message: 'Error resending verification code'
        });
    }
};

const signOut = async (req, res) => {
    try {
        if (req.session) {
            await new Promise((resolve, reject) => {
                req.session.regenerate((err) => {
                    if (err) {
                        console.error('session regenerate', err);
                        return reject(err);
                    } else {
                        resolve();
                    }
                });
            })
            res.clearCookie('connect.sid');

            return res.status(200).json({
                success: true,
                message: 'Signout successful'
            });
        };

        res.status(200).json({
            success: true,
            message: 'Signout successful'
        });
    } catch (err) {
        console.error('Failed to signout:', err);
        res.status(500).json({
            success: false,
            message: 'error during signout'
        });
    }
}

const getUsername = async (req, res) => {
    try {
        if (req.isAuthenticated && req.isAuthenticated()) {
            return res.json({
                success: true,
                username: req.user.username
            });
        }

        if (!req.session.user) {
            return res.status(400).json({
                success: false,
                message: 'User not logged in'
            });
        }

        res.json({
            success: true,
            username: req.session.user.username
        });

    } catch (err) {
        console.error('Failed to get username', err);
        res.status(500).json({
            success: false,
            message: 'error during get username'
        });
    }
}

const googleAuth = passport.authenticate('google', {
    scope: ['profile', 'email']
});

const googleCallback = (req, res, next) => {
    passport.authenticate('google', async (err, user, info) => {
        if (err) {
            console.error('Google authentication error:', err);
            return res.redirect('/login.html?error=google-auth-failed');
        }

        if (!user) {
            if (info && info.message && info.message.includes('already registered')) {
                return res.redirect('/login.html?error=email-already-registered');
            }
            return res.redirect('/login.html?error=no-user-found');
        }

        req.session.user = {
            username: user.username,
            id: user._id
        };

        return res.redirect('/app.html');
    })(req, res, next);
};


module.exports = {
    signUp,
    signIn,
    signOut,
    getUsername,
    verifyEmail,
    resendVerificationCode,
    googleAuth,
    googleCallback
};