const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Account = require('../models/account');
const bcrypt = require('bcrypt');
require('dotenv').config();

module.exports = function(passport) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await Account.findOne({ email: profile.emails[0].value });
            
            if (user) {
                return done(null, user);
            } else {
                const randomPassword = Math.random().toString(36).slice(-10);
                const hashEncoded = 10;
                const hash = await bcrypt.hash(randomPassword, hashEncoded);
                
                const newUser = new Account({
                    username: profile.displayName,
                    email: profile.emails[0].value,
                    password: hash
                });
                
                await newUser.save();
                console.log('Google account created successfully');
                return done(null, newUser);
            }
        } catch (error) {
            console.error('Error during Google authentication:', error);
            return done(error, false);
        }
    }));
    
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await Account.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
};