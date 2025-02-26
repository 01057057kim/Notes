const bcrypt = require('bcrypt');
const account = require('../models/account');

const signUp = async (req, res) => {
    try {
        const { username, email, password } = req.body
        const existingAccount = await account.findOne({ username });
        
        if (existingAccount) {
            return res.status(400).json({
                success: false,
                message: 'Username already exists'
            });
        }

        const hashEncoded = 10
        const hash = await bcrypt.hash(password, hashEncoded);

        const newAccount = new account({
            username,
            email,
            password: hash,
        });
        
        await newAccount.save();
        console.log('Account created successfully');
        
        res.status(201).json({ 
            success: true, 
            message: 'Signup successful' 
        });
    } catch (err) {
        console.error('Failed to create account:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error during signup' 
        });
    }
};

const signIn = async (req, res) => {
    try{
        const { username, password } = req.body;
        const existingAccount = await account.findOne({ username });

        if(!existingAccount){
            return res.status(400).json({
                success: false,
                message: 'Account does not exist'
            });
        }
        const hashDecoded = await bcrypt.compare(password, existingAccount.password);
        if(!hashDecoded){
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
            message: 'Signin successful'
        });
    }catch(err){
        console.error('Failed to signin:', err);
        res.status(500).json({
            success: false,
            message: 'error during signin'
        });
    }
}

const signOut = async (req, res) => {
    try{
        if(req.session){
            await new Promise((resolve, reject) => {
                req.session.regenerate((err) => {
                    if(err){
                        console.error('session regenerate', err);
                        return reject(err);
                    }else{
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
    }catch(err){
        console.error('Failed to signout:', err);
        res.status(500).json({
            success: false,
            message: 'error during signout'
        });
    }
}

const getUsername = async (req, res) => {
    try{
        if(!req.session.user){
            return res.status(400).json({
                success: false,
                message: 'User not logged in'
            });
        }
        res.json({
            success: true,
            username: req.session.user.username
        })

    }catch(err){
        console.error('Failed to get username', err);
        res.status(500).json({
            success: false,
            message: 'error during get username'
        })
    }
}

module.exports = {
    signUp,
    signIn,
    signOut,
    getUsername
};

