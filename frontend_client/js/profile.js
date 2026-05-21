// import { userDetails } from "../data/user.js";
import { getProfile, getInitials } from "../data/user.js"

const token = localStorage.getItem("token");
// let userDetails;
// Global API variable that updates with toggle
let API_BASE_URL = localStorage.getItem('apiMode') ? localStorage.getItem('apiMode') : 'https://clinic-appointment-4lxl.onrender.com';

const av = document.querySelector(".av");
const message = document.getElementById("message")
const initials = document.querySelector(".initials");
const profileName = document.querySelector(".profile-name");
const profileMeta = document.querySelector(".profile-meta")
const profileUuid = document.querySelector(".profile-uuid")
const logoutBtn = document.getElementById("logout")
const deleteBtn = document.getElementById("deleteAcc")

if (!token) {
    window.location.href = "signin.html";
}
getInitials(av)

let userDetails;

async function loadProfile() {
    userDetails = await getProfile(token);
    profile();
}

loadProfile();

function profile() {
    initials.innerHTML = `${userDetails.first_name.charAt(0)}${userDetails.last_name.charAt(0)}`
    profileName.innerHTML = `${userDetails.first_name} ${userDetails.last_name}`
    profileMeta.innerHTML = `Patient since ${userDetails.created_at.split('T')[0]}`
    profileUuid.innerHTML = `UUID: ${userDetails.user_id}`
    console.log();


    document.getElementById("first_name").value = userDetails.first_name
    document.getElementById("last_name").value = userDetails.last_name

    document.getElementById("email").value = userDetails.email
    document.getElementById("phone").value = userDetails.phone
    userDetails.dob ? document.getElementById('dob').value = userDetails.dob.split('T')[0] : document.getElementById('dob').setAttribute('placeholder', 'Update DOB');
    userDetails.gender ? document.getElementById('gender').value = userDetails.gender : document.getElementById('gender').setAttribute('placeholder', 'Update gender');
    userDetails.address ? document.getElementById('address').value = userDetails.address : document.getElementById('address').setAttribute('placeholder', 'Update address');

}

const toggleEditBtn = document.getElementById("toggle-edit");
const toggleSaveBtn = document.getElementById("save-edit");
const toggleCancelBtn = document.getElementById("cancel-edit");

toggleEditBtn.addEventListener("click", () => {
    toggleEdit('personal-form')
})

toggleSaveBtn.addEventListener("click", () => {
    saveEdit('personal-form')
})

toggleCancelBtn.addEventListener("click", () => {
    cancelEdit('personal-form')
})

function toggleEdit(formId) {
    const form = document.getElementById(formId);
    const editing = form.dataset.editing === 'true';
    const inputs = form.querySelectorAll('.field-input');
    const saveRow = document.getElementById(formId.replace('-form', '-save-row')) || form.querySelector('[id$="-save-row"]');
    if (!editing) {
        inputs.forEach(i => i.removeAttribute('readonly'));
        if (saveRow) saveRow.style.display = 'flex';
        form.dataset.editing = 'true';
    } else {
        cancelEdit(formId);
    }
}

async function saveEdit(formId) {
    const form = document.getElementById(formId);
    const inputs = form.querySelectorAll('.field-input');
    const saveRow = document.getElementById(formId.replace('-form', '-save-row')) || form.querySelector('[id$="-save-row"]');
    inputs.forEach(i => i.setAttribute('readonly', true));
    if (saveRow) saveRow.style.display = 'none';
    form.dataset.editing = 'false';

    try {
        const data = {
            first_name: document.getElementById("first_name").value,
            last_name: document.getElementById("last_name").value,
            email: document.getElementById("email").value,
            phone: document.getElementById("phone").value,
            dob: document.getElementById('dob').value,
            gender: document.getElementById('gender').value,
            address: document.getElementById('address').value
        };

        const res = await fetch(`${API_BASE_URL}/api/user/update/profile`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "token": `${token}`
            },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (result.success) {
            showMessage("success", "Update successful!");
        } else {
            showMessage("error", result.message);
        }
        loadProfile()
    } catch (error) {
        console.error(error);
        message.textContent = "Something went wrong.";

    }
}

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

function cancelEdit(formId) {
    const form = document.getElementById(formId);
    const inputs = form.querySelectorAll('.field-input');
    const saveRow = document.getElementById(formId.replace('-form', '-save-row')) || form.querySelector('[id$="-save-row"]');
    inputs.forEach(i => i.setAttribute('readonly', true));
    if (saveRow) saveRow.style.display = 'none';
    form.dataset.editing = 'false';
    loadProfile()
}

// logoutBtn.addEventListener("click", (e) => {
//     e.preventDefault()
//     confirm("Are you sure you want to log out?")
//     localStorage.removeItem("token")
//     localStorage.removeItem("initials")
//     setTimeout(() => {
//         location.reload();
//     }, 1000);
// })

window.openModal = function openModal() {
    document.getElementById("modalOverlay").classList.add("open")
}
window.closeModal = function closeModal() {
    document.getElementById("modalOverlay").classList.remove("open");
}

document.getElementById("modalOverlay").addEventListener("click", e => {
    if (e.target === e.currentTarget) closeModal();
});

document.getElementById("modalConfirm").addEventListener("click", () => {
    // cancelAppointment(apptDetails.id)
    localStorage.removeItem("token")
    localStorage.removeItem("initials")
    setTimeout(() => {
        location.reload();
    }, 1000);
    document.getElementById("modalOverlay").classList.remove("open");
})

deleteBtn.addEventListener("click", (e) => {
    e.preventDefault()
    confirm("Do you want to delete your account?")
    alert("Sikeeee!!!!! 😂😂 ....... I ain't deleting your account")
})

// function initApiToggle() {
//     const toggle = document.getElementById('apiToggle');
//     if (!toggle) return;

//     // Load saved preference
//     const savedMode = localStorage.getItem('apiMode');
//     if (savedMode === 'render') {
//         toggle.checked = true;
//         API_BASE_URL = 'https://clinic-appointment-4lxl.onrender.com';
//         toggle.closest('.toggle-label').classList.add('on');
//     }

//     toggle.addEventListener('change', function () {
//         if (this.checked) {
//             API_BASE_URL = 'https://clinic-appointment-4lxl.onrender.com';
//             localStorage.setItem('apiMode', API_BASE_URL);
//         } else {
//             API_BASE_URL = 'http://localhost:4000';
//             localStorage.setItem('apiMode', API_BASE_URL);
//         }

//         console.log('API URL changed to:', API_BASE_URL);

//         // Optional: Reload data with new API
//         // location.reload(); // Or refresh your data
//     });
// }

// // document.addEventListener('DOMContentLoaded', initApiToggle);
// initApiToggle()

window.switchPTab = function switchPTab(name, btn) {
    document.querySelectorAll('.ptab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.ptab').forEach(b => b.classList.remove('active'));
    document.getElementById('ptab-' + name).classList.add('active');
    btn.classList.add('active');
}

const newPwd = document.getElementById("newPwd").value
const confirmNewPwd = document.getElementById("confirmNewPwd").value
const updatePwdBtn = document.getElementById("updatePwd")

updatePwdBtn.addEventListener("click", async (e) => {
    e.preventDefault()

    if (!newPwd || !confirmNewPwd) {
        showPasswordMessage("error", "Passwords missing!")
        return
    }


    if (newPwd !== confirmNewPwd) {
        showPasswordMessage("error", "Passwords do not match!")
        return
    }

    if (newPwd.length > 0 && newPwd.length < 8) {
        showPasswordMessage("error", "Password must be at least 8 characters");
        return;
    }

    try {
        const data = { password: newPwd.value }

        const res = await fetch("https://clinic-appointment-4lxl.onrender.com/api/user/update-password", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "token": `${token}`
            },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (result.success) {
            showPasswordMessage("success", "Password changed successfully!");
        } else {
            showPasswordMessage("error", result.message);
        }
    } catch (error) {
        showPasswordMessage("error", "Something went wrong. Please try again later");
    }

})

function showPasswordMessage(type, text) {
    const message = document.getElementById("passwordMessage");
    message.classList.remove("success", "error");
    message.classList.add(type);
    message.textContent = text;
    setTimeout(() => {
        message.classList.remove("success", "error");
        message.textContent = "";
    }, 3000);
}