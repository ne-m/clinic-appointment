let API_BASE_URL = localStorage.getItem('apiMode') ? localStorage.getItem('apiMode') : 'https://clinic-appointment-4lxl.onrender.com';


// Simple client-side validation
const form = document.getElementById('registrationForm')
const message = document.getElementById("message")

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value;

    // Remove existing error messages
    const existingErrors = document.querySelectorAll('.error-message');
    existingErrors.forEach(error => error.remove());

    if (!password) {
        // const errorDiv = document.createElement('div');
        // errorDiv.className = 'error-message';
        // errorDiv.textContent = 'Enter a password';
        // document.getElementById('password').parentNode.appendChild(errorDiv);
        showMessage("error", "Password field is empty!");
        return;
    }

    if (!email) {
        // const errorDiv = document.createElement('div');
        // errorDiv.className = 'error-message';
        // errorDiv.textContent = 'Enter an email';
        // document.getElementById('email').parentNode.appendChild(errorDiv);
        showMessage("error", "Email field is empty!");
        return;
    }

    try {
        const data = {
            email: document.getElementById("email").value,
            password: document.getElementById("password").value
        };
        const res = await fetch(`${API_BASE_URL}/api/user/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await res.json();


        if (result.success) {
            localStorage.setItem("token", result.token);
            showMessage("success", "Logged in successful!");
            // Redirect
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