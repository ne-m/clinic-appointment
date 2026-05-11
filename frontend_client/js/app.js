import { getInitials, getProfile } from "../data/user.js";

const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "signin.html";
}

let API_BASE_URL = localStorage.getItem('apiMode')? localStorage.getItem('apiMode') : 'https://clinic-appointment-4lxl.onrender.com';

const av = document.querySelector(".av");
const greeting = document.querySelector('.hero-greeting');
const heroDate = document.querySelector(".hero-date")
const doctorList = document.querySelector(".doctor-list")
const nextApptCard = document.querySelector(".next-appt-card")

const today = new Date();
const hour = today.getHours();
let text = "Good evening";
let userDetails;
let doctors;
let nextAppt;
let doctorHTML = "";
let nextApptHTML = "";

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
    const res = await fetch(`${API_BASE_URL}/api/user/list-doctors`, {
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

async function fetchNextAppointment() {
    const res = await fetch("http://localhost:4000/api/user/upcoming-appointment", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "token": `${token}`
        }
    });

    let data = await res.json();

    if (data.success) {
        return data.appointmentData;
    } else {
        console.log(data.message);
    }
}

async function loadDoctors() {
    doctors = await fetchDoctors()
    nextAppt = await fetchNextAppointment()
    if (Object.keys(nextAppt).length !== 0) {
        renderNextAppt()
    }
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

function renderNextAppt(){
    nextApptHTML += `
        <div style="display:flex;align-items:center;gap:10px;flex:1;flex-wrap:wrap;">
            <div style="width:40px;height:40px;border-radius:10px;background:#1D9E75;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="3" y="4" width="14" height="13" rx="2" stroke="white" stroke-width="1.5" />
                    <path d="M7 2v4M13 2v4M3 8h14" stroke="white" stroke-width="1.5" stroke-linecap="round" />
                </svg>
            </div>
            <div>
                <div style="font-size:11px;color:#0F6E56;font-weight:500;text-transform:uppercase;letter-spacing:.06em;">
                    Next appointment
                </div>
                <div style="font-size:14px;font-weight:500;color:#04342C;">${nextAppt.doctor_name} · ${formatDate(nextAppt.appointment_date)} at ${nextAppt.slot_time}</div>
                <div style="font-size:12px;color:#0F6E56; text-transform: capitalize;">${nextAppt.specialization} · ${nextAppt.status}</div>
            </div>
        </div>
        <button class="btn-outline" style="font-size:12px;padding:6px 12px;flex-shrink:0;" onclick="window.location.href='appointments.html?tab=upcoming'">View details</button>
    `

    nextApptCard.style.border = "0.5px solid #9FE1CB";
    nextApptCard.style.borderRadius = "12px";
    nextApptCard.style.padding = "14px 16px";

    // border: 0.5px solid #9FE1CB;
    // border-radius: 12px;
    // padding: 14px 16px;
    nextApptCard.innerHTML = nextApptHTML
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

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short"
    });
}