// import { userDetails } from "../data/user.js";
import { getProfile, getInitials } from "../data/user.js"

const token = localStorage.getItem("token");
// let userDetails;

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

        const res = await fetch("https://clinic-appointment-4lxl.onrender.com/api/user/update/profile", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "token": `${token}`
            },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (result.success) {
            message.style.color = "green";
            message.textContent = "Update successful!";
        } else {
            message.style.color = "red";
            message.textContent = result.message;
        }
        loadProfile()
    } catch (error) {
        console.error(error);
        message.textContent = "Something went wrong.";

    }



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


logoutBtn.addEventListener("click", (e) => {
    e.preventDefault()
    confirm("Are you sure you want to log out?")
    localStorage.clear("token")
    localStorage.clear("initials")
    setTimeout(() => {
        location.reload();
    }, 1000);

})

deleteBtn.addEventListener("click",(e)=>{
    e.preventDefault()
    confirm("Do you want to delete your account?")
    alert("Sikeeee!!!!! 😂😂 ....... I ain't deleting your account")
})