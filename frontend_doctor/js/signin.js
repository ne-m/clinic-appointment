const form = document.getElementById('registrationForm')
const message = document.getElementById("message")

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value;

    const existingErrors = document.querySelectorAll('.error-message');
    existingErrors.forEach(error => error.remove());

    if (!password) {
        showMessage("error", "Password field is empty!");
        return;
    }

    if (!email) {
        showMessage("error", "Email field is empty!");
        return;
    }

    try {
        const data = {
            email: document.getElementById("email").value,
            password: document.getElementById("password").value
        };
        const res = await fetch("https://clinic-appointment-4lxl.onrender.com/api/doctor/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await res.json();


        if (result.success) {
            localStorage.setItem("dtoken", result.token);
            showMessage("success", "Logged in successful!");
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