const form = document.getElementById('registrationForm')
const message = document.getElementById("message")

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value;

    const existingErrors = document.querySelectorAll('.error-message');
    existingErrors.forEach(error => error.remove());

    if (!password) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'Enter a password';
        document.getElementById('password').parentNode.appendChild(errorDiv);
        return;
    }

    if (!email) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'Enter an email';
        document.getElementById('email').parentNode.appendChild(errorDiv);
        return;
    }

    try {
        const data = {
            email: document.getElementById("email").value,
            password: document.getElementById("password").value
        };
        const res = await fetch("http://localhost:4000/api/doctor/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await res.json();


        if (result.success) {
            localStorage.setItem("dtoken", result.token);
            message.style.color = "green";
            message.textContent = "Logged in successful!";

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