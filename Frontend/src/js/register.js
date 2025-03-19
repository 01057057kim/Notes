document.getElementById('back').addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '/index.html';
});

document.getElementById('signup-form').addEventListener('submit', async function (event) {
    event.preventDefault();
    const signupButton = event.submitter;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        ntf('Password and Confirm Password do not match', 'error');
        return;
    }

    signupButton.disabled = true;
    signupButton.textContent = 'Loading...';

    try {
        const response = await fetch('http://localhost:3000/account/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                email,
                password
            })
        });

        const data = await response.json();

        if (data.success) {
            sessionStorage.setItem('verificationEmail', email);
            document.querySelector('.container').style.display = 'none';
            document.querySelector('.container-verification').style.display = 'block';
            ntf('Please check your email for verification code', 'warning');
        } else {
            if (data.message && data.message.toLowerCase().includes('email already')) {
                ntf('This email is already registered. Please use a different email or try logging in.', 'error');
                document.getElementById('email').focus();
            } else {
                ntf(data.message, 'error');
            }
        }
    } catch (error) {
        console.error('Error registering user:', error);
        ntf('Failed to register. Please try again.', 'error');
    } finally {
        signupButton.disabled = false;
        signupButton.textContent = 'Sign up';
    }
});

document.getElementById('verification-form').addEventListener('submit', async function (event) {
    event.preventDefault();
    const confirmButton = event.submitter;
    confirmButton.disabled = true;
    confirmButton.textContent = 'Loading...';

    const code = document.querySelector('.passcode input').value;
    const email = sessionStorage.getItem('verificationEmail');

    if (!code) {
        ntf('Please enter verification code', 'warning');
        confirmButton.disabled = false;
        confirmButton.textContent = 'Confirm';
        return;
    }

    if (!email) {
        ntf('Email information missing. Please try signing up again.', 'error');
        window.location.reload();
        confirmButton.disabled = false;
        confirmButton.textContent = 'Confirm';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/account/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                code
            })
        });

        const data = await response.json();
        ntf(data.message, data.success ? 'success' : 'error');

        if (data.success) {
            sessionStorage.removeItem('verificationEmail');
            window.location.href = '/login.html';
            ntf(data.message, data.success ? 'success' : 'error');
        }
    } catch (error) {
        console.error('Error verifying email:', error);
        ntf('Failed to verify email. Please try again.', 'error');
    } finally {
        confirmButton.disabled = false;
        confirmButton.textContent = 'Confirm';
    }
});

document.getElementById('back-verify').addEventListener('click', function () {
    document.querySelector('.container').style.display = 'block';
    document.querySelector('.container-verification').style.display = 'none';
});

document.getElementById('resend-code').addEventListener('click', async function () {
    const resendButton = this;
    resendButton.disabled = true;
    resendButton.textContent = 'Sending...';

    const email = sessionStorage.getItem('verificationEmail');

    if (!email) {
        ntf('Email information missing. Please try signing up again.', 'error');
        window.location.reload();
        resendButton.disabled = false;
        resendButton.textContent = 'Resend Code';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/account/resend-verification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        ntf(data.message, data.success ? 'warning' : 'error');
    } catch (error) {
        console.error('Error resending verification code:', error);
        ntf('Failed to resend verification code. Please try again.', 'error');
    } finally {
        resendButton.disabled = false;
        resendButton.textContent = 'Resend Code';
    }
});