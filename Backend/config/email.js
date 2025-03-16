const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Function to send verification email
const sendVerificationEmail = async (email, code) => {
    try {
        const mailOptions = {
            from: 'no-reply',
            to: email,
            subject: 'Email Verification for NoteNest',
            html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
            <h2 style="color: #333; text-align: center;">Email Verification</h2>
            <p>Thank you for registering with our Notes application. To complete your registration, please use the verification code below:</p>
            <div style="background-color: #f2f2f2; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
              ${code}
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you did not request this verification, please ignore this email.</p>
          </div>
        `
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

module.exports = { sendVerificationEmail };