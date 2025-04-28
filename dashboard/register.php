<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles/register/styles@0.0.3.css">

    
</head>
<body>
    <div class="glow"></div>
    
    <div class="register-container">
        <div class="register-header">
            <h1 class="register-title">REGISTER</h1>
            <p class="register-subtitle">Create your account</p>
        </div>
        
        <form id="registerForm">
            <div class="form-group">
                <input type="text" id="username" name="username" class="form-input" placeholder="Username" required>
                <svg class="form-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </div>
            
            <div class="form-group">
                <input type="password" id="password" name="password" class="form-input" placeholder="Password" required>
                <svg class="form-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
            </div>
            
            <div class="form-group">
                <input type="password" id="confirmPassword" name="confirmPassword" class="form-input" placeholder="Confirm Password" required>
                <svg class="form-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
            </div>
            
            <button type="submit" class="register-button">Register</button>
            <div id="errorMessage" class="error-message"></div>
        </form>
        
        <div class="register-footer">
            Do you have an account? <a href="login" class="register-link">Login</a>
        </div>
    </div>

    <script>
        document.addEventListener('mousemove', (e) => {
            const glow = document.querySelector('.glow');
            const x = e.clientX;
            const y = e.clientY;
            
            glow.style.left = `${x - 250}px`;
            glow.style.top = `${y - 250}px`;
        });

        const form = document.getElementById('registerForm');
        const errorMessage = document.getElementById('errorMessage');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            

            errorMessage.textContent = '';
            passwordInput.classList.remove('password-mismatch');
            confirmPasswordInput.classList.remove('password-mismatch');
            

            if (passwordInput.value !== confirmPasswordInput.value) {
                errorMessage.textContent = 'Passwords do not match!';
                passwordInput.classList.add('password-mismatch');
                confirmPasswordInput.classList.add('password-mismatch');
                return;
            }
            
            const registerButton = document.querySelector('.register-button');
            registerButton.textContent = 'Registering...';
            registerButton.disabled = true;

            const formData = new FormData(form);
            const data = {
                username: formData.get('username'),
                password: formData.get('password')
            };

            try {
                const response = await fetch('api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    window.location.href = result.redirect || 'https://bebetter-fivem.space';
                } else {
                    errorMessage.textContent = result.message || 'Error with register!';
                    registerButton.textContent = 'Register';
                    registerButton.disabled = false;
                }
            } catch (error) {
                errorMessage.textContent = 'Error with connecting to server!';
                registerButton.textContent = 'Register';
                registerButton.disabled = false;
                console.error(error);
            }
        });


        confirmPasswordInput.addEventListener('input', () => {
            if (passwordInput.value !== confirmPasswordInput.value) {
                passwordInput.classList.add('password-mismatch');
                confirmPasswordInput.classList.add('password-mismatch');
            } else {
                passwordInput.classList.remove('password-mismatch');
                confirmPasswordInput.classList.remove('password-mismatch');
            }
        });

        passwordInput.addEventListener('input', () => {
            if (passwordInput.value !== confirmPasswordInput.value && confirmPasswordInput.value) {
                passwordInput.classList.add('password-mismatch');
                confirmPasswordInput.classList.add('password-mismatch');
            } else {
                passwordInput.classList.remove('password-mismatch');
                confirmPasswordInput.classList.remove('password-mismatch');
            }
        });
    </script>
</body>
</html>
