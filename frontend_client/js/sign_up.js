// Simple client-side validation
import { saveToLocalStorage } from "../data/user.js";

let API_BASE_URL = localStorage.getItem('apiMode') ?localStorage.getItem('apiMode') : 'https://clinic-appointment-4lxl.onrender.com';
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
        // const errorDiv = document.createElement('div');
        // errorDiv.className = 'error-message';
        // errorDiv.textContent = 'Passwords do not match';
        // document.getElementById('confirm_password').parentNode.appendChild(errorDiv);
        showMessage("error", "Passwords do not match");
        return;
    }

    if (password.length > 0 && password.length < 8) {
        // e.preventDefault();
        // const errorDiv = document.createElement('div');
        // errorDiv.className = 'error-message';
        // errorDiv.textContent = 'Password must be at least 8 characters';
        // document.getElementById('password').parentNode.appendChild(errorDiv);
        showMessage("error", "Password must be at least 8 characters");
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
        const res = await fetch("https://clinic-appointment-4lxl.onrender.com/api/user/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (result.success) {
            saveToLocalStorage(result.token)
            showMessage("success", "Registration successful!");
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1000);

        } else {
            showMessage("error", result.message);
        }

    } catch (error) {
        showMessage("error", "Something went wrong. Pleas try again later");
    }
});

function showMessage(type, text) {
    const message = document.getElementById("message");
    message.classList.remove("success", "error");
    message.classList.add(type);
    message.textContent = text;
    setTimeout(() => {
        message.classList.remove("success", "error");
        message.textContent = "";
    }, 3000);
}