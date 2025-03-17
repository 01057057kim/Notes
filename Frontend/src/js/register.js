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

document.addEventListener('DOMContentLoaded', function () {
    const passwordInput = document.getElementById('password');
    const popup = document.createElement('div');
    popup.className = 'password-requirements-popup';
    popup.innerHTML = `
<h4>Password must contain:</h4>
<div class="requirements-list">
    <div class="requirement" data-requirement="length"><span class="icon">✘</span> At least 8 characters</div>
    <div class="requirement" data-requirement="uppercase"><span class="icon">✘</span> At least one uppercase letter</div>
    <div class="requirement" data-requirement="lowercase"><span class="icon">✘</span> At least one lowercase letter</div>
    <div class="requirement" data-requirement="number"><span class="icon">✘</span> At least one number</div>
    <div class="requirement" data-requirement="special"><span class="icon">✘</span> At least one special character</div>
</div>
`;
    document.body.appendChild(popup);
    passwordInput.addEventListener('mouseenter', showPasswordRequirements);
    passwordInput.addEventListener('focus', showPasswordRequirements);

    passwordInput.addEventListener('mouseleave', function (e) {
        if (document.activeElement !== passwordInput) {
            popup.classList.remove('visible');
        }
    });

    passwordInput.addEventListener('blur', function (e) {
        if (!passwordInput.matches(':hover')) {
            popup.classList.remove('visible');
        }
    });

    function showPasswordRequirements() {
        const rect = passwordInput.getBoundingClientRect();
        popup.style.top = (rect.bottom + window.scrollY + 10) + 'px';
        popup.style.left = (rect.left + window.scrollX) + 'px';

        popup.classList.add('visible');

        validatePassword();
    }

    passwordInput.addEventListener('input', validatePassword);

    function validatePassword() {
        const value = passwordInput.value;
        const requirements = {
            length: /.{8,}/,
            uppercase: /[A-Z]/,
            lowercase: /[a-z]/,
            number: /[0-9]/,
            special: /[^A-Za-z0-9]/
        };

        Object.keys(requirements).forEach(req => {
            const requirementElement = popup.querySelector(`[data-requirement="${req}"]`);
            const isValid = requirements[req].test(value);

            if (isValid) {
                requirementElement.classList.add('valid');
                requirementElement.classList.remove('invalid');
                requirementElement.querySelector('.icon').textContent = '✓';
            } else {
                requirementElement.classList.add('invalid');
                requirementElement.classList.remove('valid');
                requirementElement.querySelector('.icon').textContent = '✘';
            }
        });
    }

    document.getElementById('signup-form').addEventListener('submit', function (event) {
        const value = passwordInput.value;
        const requirements = {
            length: /.{8,}/,
            uppercase: /[A-Z]/,
            lowercase: /[a-z]/,
            number: /[0-9]/,
            special: /[^A-Za-z0-9]/
        };

        const allRequirementsMet = Object.values(requirements).every(regex => regex.test(value));

        if (!allRequirementsMet) {
            event.preventDefault();
            ntf('Password does not meet all requirements', 'error');
            showPasswordRequirements();
            return false;
        }

    }, true);
});