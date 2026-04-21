// Simple client-side validation
import { saveToLocalStorage } from "../data/user.js";

const form = document.getElementById('registrationForm')
const message = document.getElementById("message")

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;

    // Remove existing error messages
    const existingErrors = document.querySelectorAll('.error-message');
    existingErrors.forEach(error => error.remove());

    if (password !== confirmPassword) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'Passwords do not match';
        document.getElementById('confirm_password').parentNode.appendChild(errorDiv);
        return;
    }

    if (password.length > 0 && password.length < 8) {
        // e.preventDefault();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'Password must be at least 8 characters';
        document.getElementById('password').parentNode.appendChild(errorDiv);
        return;
    }

    try {
        const data = {
            first_name: document.getElementById("first_name").value,
            last_name: document.getElementById("last_name").value,
            email: document.getElementById("email").value,
            phone: document.getElementById("phone").value,
            password: document.getElementById("password").value,
            role: "patient"
        };
        const res = await fetch("http://localhost:4000/api/user/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await res.json();


        if (result.success) {
            console.log(result.token);
            // Save token
            // localStorage.setItem("token", result.token);
            saveToLocalStorage(result.token)

            message.style.color = "green";
            message.textContent = "Registration successful!";

            // Redirect (optional)
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1000);

        } else {
            message.style.color = "red";
            message.textContent = result.message;
        }

    } catch (error) {
        console.error(error);
        message.textContent = "Something went wrong.";
    }
});