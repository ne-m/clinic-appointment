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
    const res = await fetch("https://clinic-appointment-4lxl.onrender.com/api/doctor/profile", {
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
    userDetails.image === "default-avatar.png" ? "" : loadAvatar()
    initials.innerHTML = `${userDetails.first_name.charAt(0)}${userDetails.last_name.charAt(0)}`
    av.innerHTML = `${userDetails.first_name.charAt(0)}${userDetails.last_name.charAt(0)}`
    localStorage.setItem("docInitials", `${userDetails.first_name.charAt(0)}${userDetails.last_name.charAt(0)}`)
    profileName.innerHTML = `${userDetails.first_name} ${userDetails.last_name}`
    profileMeta.innerHTML = `Doctor · Member since ${userDetails.created_at.split('T')[0]}`
    profileUuid.innerHTML = `UUID: ${userDetails.user_id}`

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

function loadAvatar() {
    const removeBtn = document.getElementById("removeAvatarBtn");
    if (userDetails.image) {
        document.getElementById("avatarImg").src = userDetails.image;
        document.getElementById("avatarImg").style.display = "block";
        document.getElementById("avatarInitials").style.display = "none";
        removeBtn.style.display = "flex";
    } else {
        document.getElementById("avatarImg").style.display = "none";
        document.getElementById("avatarInitials").style.display = "block";
        removeBtn.style.display = "none";
    }
}

document.getElementById("avatarEditBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    document.getElementById("avatarDropdown").classList.toggle("open");
});

document.addEventListener("click", () => {
    document.getElementById("avatarDropdown").classList.remove("open");
});

document.getElementById("avatarInput").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        // showToast("Image must be under 2MB");
        alert("Image must be under 2MB")
        return;
    }
    uploadImage(file)
});

async function uploadImage(file) {
    const formData = new FormData();
    formData.append("image", file);

    try {
        const res = await fetch("https://clinic-appointment-4lxl.onrender.com/api/doctor/update-profile-picture", {
            method: "PUT",
            headers: { dtoken: dtoken },
            body: formData,
        });
        const data = await res.json();

        if (data.success) {
            alert("Image uploaded");
            userDetails.image = data.imageUrl
            loadAvatar();
        } else {
            // alert(data.message);
            alert("Could not update profile image. Try again later")
        }
    } catch (err) {
        console.error(err);
    }
}

window.confirmRemoveAvatar = function confirmRemoveAvatar() {
    document.getElementById("avatarDropdown").classList.remove("open");
    openModal("removeAvatar"); 
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

        const res = await fetch("https://clinic-appointment-4lxl.onrender.com/api/doctor/update-profile", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "dtoken": `${dtoken}`
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

function cancelEdit(formId) {
    const form = document.getElementById(formId);
    const inputs = form.querySelectorAll('.field-input');
    const saveRow = document.getElementById(formId.replace('-form', '-save-row')) || form.querySelector('[id$="-save-row"]');
    inputs.forEach(i => i.setAttribute('readonly', true));
    if (saveRow) saveRow.style.display = 'none';
    form.dataset.editing = 'false';
    loadProfile()
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

window.switchPTab = function switchPTab(name, btn) {
    document.querySelectorAll('.ptab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.ptab').forEach(b => b.classList.remove('active'));
    document.getElementById('ptab-' + name).classList.add('active');
    btn.classList.add('active');
}

const newPwd = document.getElementById("newPwd")
const confirmNewPwd = document.getElementById("confirmNewPwd")
const updatePwdBtn = document.getElementById("updatePwd")

updatePwdBtn.addEventListener("click", async (e) => {
    e.preventDefault()

    if (!newPwd.value || !confirmNewPwd.value) {
        showPasswordMessage("error", "Passwords missing!")
        return
    }

    if (newPwd.value !== confirmNewPwd.value) {
        showPasswordMessage("error", "Passwords do not match!")
        return
    }

    if (newPwd.value.length > 0 && newPwd.value.length < 8) {
        showPasswordMessage("error", "Password must be at least 8 characters");
        return;
    }

    try {
        const data = { password: newPwd.value }

        const res = await fetch("https://clinic-appointment-4lxl.onrender.com/api/doctor/update-password", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "dtoken": `${dtoken}`
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

let activeCfg;

const MODAL_CFG = {
    logout: {
        title: "Log out?",
        sub: "Hope to see you soon. You'll need to sign in again to access your account.",
        icon: `X`,           
        iconBg: "rgba(24,95,165,.12)",
        iconColor: "var(--text-info)",
        confirmLabel: "Log out",
        confirmCls: "btn-blue",
        requiresInput: false,
        action() {
            localStorage.removeItem("dtoken")
            localStorage.removeItem("docInitials")
            setTimeout(() => {
                location.reload();
            }, 1000);
        }
    },
    removeAvatar: {
        title: "Remove profile photo?",
        sub: "Your initials will be shown instead. You can upload a new photo at any time.",
        icon: `<svg viewBox="-2.5 0 61 61" xmlns="http://www.w3.org/2000/svg" fill="#DC2626"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><defs><filter id="a" width="200%" height="200%" x="-50%" y="-50%" filterUnits="objectBoundingBox"><feOffset dy="1" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset><feGaussianBlur stdDeviation="10" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" in="shadowBlurOuter1" result="shadowMatrixOuter1"></feColorMatrix><feMerge><feMergeNode in="shadowMatrixOuter1"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge></filter></defs><path fill-rule="evenodd" d="M36 26v10.997c0 1.659-1.337 3.003-3.009 3.003h-9.981c-1.662 0-3.009-1.342-3.009-3.003v-10.997h16zm-2 0v10.998c0 .554-.456 1.002-1.002 1.002h-9.995c-.554 0-1.002-.456-1.002-1.002v-10.998h12zm-9-5c0-.552.451-1 .991-1h4.018c.547 0 .991.444.991 1 0 .552-.451 1-.991 1h-4.018c-.547 0-.991-.444-.991-1zm0 6.997c0-.551.444-.997 1-.997.552 0 1 .453 1 .997v6.006c0 .551-.444.997-1 .997-.552 0-1-.453-1-.997v-6.006zm4 0c0-.551.444-.997 1-.997.552 0 1 .453 1 .997v6.006c0 .551-.444.997-1 .997-.552 0-1-.453-1-.997v-6.006zm-6-5.997h-4.008c-.536 0-.992.448-.992 1 0 .556.444 1 .992 1h18.016c.536 0 .992-.448.992-1 0-.556-.444-1-.992-1h-4.008v-1c0-1.653-1.343-3-3-3h-3.999c-1.652 0-3 1.343-3 3v1z" filter="url(#a)"></path></g></svg>`,           // your trash icon SVG
        iconBg: "rgba(163,45,45,.12)",
        iconColor: "var(--red-text)",
        confirmLabel: "Remove photo",
        confirmCls: "btn-red",
        requiresInput: false,
        async action() {
            try {
                const res = await fetch("https://clinic-appointment-4lxl.onrender.com/api/doctor/remove-profile-picture", {
                    method: "DELETE",
                    headers: {
                        "dtoken": dtoken
                    }
                }
                );

                const data = await res.json();

                if (data.success) {
                    alert("Image deleted");
                    userDetails.image = "default-avatar.png"
                    loadProfile()
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error(error);
            }
        }
    },
};

window.openModal = function openModal(key) {
    const cfg = MODAL_CFG[key];
    activeCfg = cfg;

    document.getElementById("modalIcon").innerHTML = cfg.icon;
    document.getElementById("modalIcon").style.background = cfg.iconBg;
    document.getElementById("modalIcon").style.color = cfg.iconColor;
    document.getElementById("modalTitle").textContent = cfg.title;
    document.getElementById("modalSub").textContent = cfg.sub;

    const confirmBtn = document.getElementById("modalConfirm");
    confirmBtn.textContent = cfg.confirmLabel;
    confirmBtn.className = `action-btn ${cfg.confirmCls}`;

    const fieldWrap = document.getElementById("confirmFieldWrap");
    if (cfg.requiresInput) {
        document.getElementById("confirmFieldLabel").textContent = cfg.inputLabel;
        document.getElementById("confirmInput").value = "";
        fieldWrap.style.display = "flex";
        fieldWrap.style.flexDirection = "column"
        fieldWrap.style.justifyContent = "center"
        fieldWrap.style.gap = "5px"
        fieldWrap.style.textAlign = "center"
        fieldWrap.style.marginBottom = "10px"
        confirmBtn.disabled = true;
        setTimeout(() => document.getElementById("confirmInput").focus(), 220);
    } else {
        fieldWrap.style.display = "none";
        confirmBtn.disabled = false;
    }

    document.getElementById("modalOverlay").classList.add("open");
}

window.onConfirmInput = function onConfirmInput() {
    const val = document.getElementById("confirmInput").value;
    const match = val === activeCfg.confirmWord;
    document.getElementById("modalConfirm").disabled = !match;
}

window.closeModal = function closeModal() {
    document.getElementById("modalOverlay").classList.remove("open");
    activeCfg = null;
}

window.runModalAction = function runModalAction() {
    if (!activeCfg) return;
    const action = activeCfg.action;  // capture before closeModal() nulls activeCfg
    closeModal();
    action();
}