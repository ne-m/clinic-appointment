import { getInitials, getProfile } from "../data/user.js";

const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "signin.html";
}

const av = document.querySelector(".av");
const greeting = document.querySelector('.hero-greeting');
const heroDate = document.querySelector(".hero-date")
const doctorList = document.querySelector(".doctor-list")

const today = new Date();
const hour = today.getHours();
let text = "Good evening";
let userDetails;
let doctors;
let doctorHTML = "";

const formattedDate = today.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
});
heroDate.innerHTML = formattedDate

getInitials(av)

if (hour < 12) text = "Good morning";
else if (hour < 18) text = "Good afternoon";

async function loadProfile() {
    userDetails = await getProfile(token);
    greeting.innerHTML = `${text}, <span class="username">${userDetails.first_name}</span> 👋`;
}

loadProfile();

async function fetchDoctors() {
    const res = await fetch("https://clinic-appointment-4lxl.onrender.com/api/user/list-doctors", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "token": `${token}`
        }
    });

    let data = await res.json();

    if (data.success) {
        return data.doctors;
    } else {
        console.log(data.message);
    }
}

async function loadDoctors() {
    doctors = await fetchDoctors()
    renderDoctors(doctors)
}
loadDoctors()

function renderDoctors(doctorsParam) {
    doctorHTML = ""
    doctorsParam.forEach(doctor => {
        doctorHTML += `                
            <div class="doctor-card">
                <img src=${doctor.image} loading="lazy" class="doctor-img" alt="Doctor">

                <div class="doctor-info">
                    <h3 class="doctor-name">${doctor.first_name + " " + doctor.last_name}</h3>
                    <p class="doctor-spec">${doctor.specialization}</p>

                    <div class="doctor-meta">
                        <span class="doctor-rating">                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1l1.5 4.5H14l-3.5 2.5 1.5 4.5L8 10l-4 2.5 1.5-4.5L2 5.5h4.5z" fill="#FFC000" />
                </svg> <!-- <i>To do</i> --> </span>
                        <span class="doctor-status ${doctor.is_working ? "available" : "busy"} ">${doctor.is_working ? "Available" : "Not available"}</span>
                    </div>

                    <button class="btn-book" ${doctor.is_working ? `onclick="openDoctor('${doctor.doctor_id}')"` : "disabled"} >Book</button>
                </div>
            </div>
                `
    })

    doctorList.innerHTML = doctorHTML
}

window.openDoctor = function openDoctor(doctorId) {
    window.location.href = `doctor.html?id=${doctorId}`;
}

document.querySelectorAll(".spec-pill").forEach(pill => {
    pill.addEventListener("click", (e) => {
        const type = pill.dataset.type;

        if (e.currentTarget.dataset.type === "All Doctors") {
            const allDoctors = doctors
            renderDoctors(allDoctors);
        } else {
            const filtered = doctors.filter(d => d.specialization === type);

            renderDoctors(filtered);
            // console.log(filtered);
        }
        // console.log(e.currentTarget.dataset.type);



    });
});
