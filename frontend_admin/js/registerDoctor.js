const form = document.getElementById('registrationForm');
const message = document.getElementById("message");

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;

    document.querySelectorAll('.error-message').forEach(el => el.remove());

    if (password !== confirmPassword) {
        showError('confirm_password', 'Passwords do not match');
        return;
    }

    if (password.length < 8) {
        showError('password', 'Password must be at least 8 characters');
        return;
    }

    try {
        const formData = new FormData();

        formData.append("first_name", document.getElementById("first_name").value);
        formData.append("last_name", document.getElementById("last_name").value);
        formData.append("email", document.getElementById("email").value);
        formData.append("phone", document.getElementById("phone").value);
        formData.append("password", password);
        formData.append("role", "doctor");

        // Doctor-specific fields
        formData.append("specialization", document.getElementById("specialization").value);
        formData.append("bio", document.getElementById("bio").value);
        formData.append("start_time", document.getElementById("start_time").value);
        formData.append("end_time", document.getElementById("end_time").value);
        formData.append("day_of_week", document.getElementById("day_of_week").value);

        // File
        const imageFile = document.getElementById("image").files[0];
        formData.append("image", imageFile);

        const res = await fetch("http://localhost:4000/api/admin/add-doctor", {
            method: "POST",
            body: formData
            // atoken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGdtYWlsLmNvbSIsInBhc3N3b3JkIjoicXdlcnR5MTIzNCIsImlhdCI6MTc3NjcxMjE5Nn0.6TfpxqraxOFrPWaX0tEYJtc71rRbhLc-IdtQUOax8Is"
        });

        const result = await res.json();

        if (result.success) {
            message.style.color = "green";
            message.textContent = "Doctor account created successfully!";

            setTimeout(() => {
                window.location.href = "index.html";
            }, 1200);

        } else {
            message.style.color = "red";
            message.textContent = result.message;
        }

    } catch (error) {
        console.error(error);
        message.style.color = "red";
        message.textContent = "Something went wrong.";
    }
});

function showError(inputId, msg) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = msg;
    document.getElementById(inputId).parentNode.appendChild(errorDiv);
}