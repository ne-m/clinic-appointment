const dtoken = localStorage.getItem("dtoken");

const message = document.getElementById("message")
const av = document.querySelector(".av");
const initials = document.querySelector(".initials");
const profileName = document.querySelector(".profile-name");
const profileMeta = document.querySelector(".profile-meta")
const profileUuid = document.querySelector(".profile-uuid")

if (!dtoken) {
    window.location.href = "signin.html";
}

async function getProfile(dtoken) {
    const res = await fetch("http://localhost:4000/api/doctor/profile", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "dtoken": `${dtoken}`
        }
    });

    let data = await res.json();

    if (data.success) {
        return data.profileData;
    } else {
        console.log(data.message);
    }
}

let userDetails;

async function loadProfile() {
    userDetails = await getProfile(dtoken);
    profile();
}

loadProfile();

function profile() {
    initials.innerHTML = `${userDetails.first_name.charAt(0)}${userDetails.last_name.charAt(0)}`
    av.innerHTML = `${userDetails.first_name.charAt(0)}${userDetails.last_name.charAt(0)}`
    profileName.innerHTML = `${userDetails.first_name} ${userDetails.last_name}`
    profileMeta.innerHTML = `Doctor · Member since ${userDetails.created_at.split('T')[0]}`
    profileUuid.innerHTML = `UUID: ${userDetails.user_id}`
    console.log();

    document.getElementById("first_name").value = userDetails.first_name
    document.getElementById("last_name").value = userDetails.last_name
    document.getElementById("email").value = userDetails.email
    document.getElementById("phone").value = userDetails.phone

    document.getElementById("start_time").value = userDetails.start_time
    document.getElementById("end_time").value = userDetails.end_time
    document.getElementById("specialization").value = userDetails.specialization
    document.getElementById("day_of_week").value = userDetails.day_of_week
    document.getElementById("bio").value = userDetails.bio

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
    console.log(formId);

    const form = document.getElementById(formId);
    const editing = form.dataset.editing === 'true';
    const inputs = form.querySelectorAll('.field-input.editable');
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

            start_time: document.getElementById('start_time').value,
            end_time: document.getElementById('end_time').value,
            bio: document.getElementById('bio').value
        };

        const res = await fetch("http://localhost:4000/api/doctor/update-profile", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "dtoken": `${dtoken}`
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
}
