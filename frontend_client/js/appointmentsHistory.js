import { getInitials } from "../data/user.js";
import { showLoading, hideLoading, showLoadingError } from "./loader.js"; 

const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "signin.html";
}
let API_BASE_URL = localStorage.getItem('apiMode') ? localStorage.getItem('apiMode') : 'https://clinic-appointment-4lxl.onrender.com';


const av = document.querySelector(".av");
const appointmentsCard = document.querySelector(".card")
let appointmentHTML = ''
let currentTab = "upcoming";
getInitials(av)

let appointments;
const params = new URLSearchParams(window.location.search);
// const doctorId = params.get("tab");
currentTab = params.get("tab") ? params.get("tab") : "upcoming"


async function fetchAppointments() {
    try {
        showLoading()
        const res = await fetch(`${API_BASE_URL}/api/user/appointments`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "token": `${token}`
            }
        });

        let data = await res.json();

        if (data.success) {
            hideLoading()
            return data.appointmentData
        } else {
            // return[]
            showLoadingError(data.message || 'Failed to load appointments');
        }
    } catch (error) {
        console.error(error);
        appointmentsCard.innerHTML = `<div class="error-message">Failed to load appointments</div>`
        return[]
    }
}

async function loadAppointments() {
    appointments = await fetchAppointments()
    initTabFromURL()
    renderAppointments()
}

loadAppointments()

function renderAppointments() {
    appointmentHTML = `
        <div >
            <p class="section-label" style="margin-bottom:12px; font-weight: bold;">Appointment history</p>
            <p class="section-label" style="margin-bottom:12px; font-size:14px;">Select an appointment to view more details</p>
        </div>
    `
    if (!appointments || appointments.length === 0) {
        appointmentsCard.innerHTML = '<div class="no-appointments">No appointments found</div>';
        return;
    }

    let filtered = appointments.filter(a => {
        if (currentTab === "upcoming") return isUpcoming(a.status);
        if (currentTab === "history") return isHistory(a.status);
    });
    
    if (filtered.length === 0) {
        appointmentsCard.innerHTML = `<div>No ${currentTab} appointments</div>`;
        return;
    }

    filtered.forEach((appointment) => {
        let badgeColor = "red";
        if (appointment.status === "scheduled") badgeColor = "amber";
        else if (appointment.status === "confirmed") badgeColor = "blue";
        else if (appointment.status === "completed") badgeColor = "green";
        else if (appointment.status === "cancelled") badgeColor = "red";
        else if (appointment.status === "no-show") badgeColor = "purple";
        else if (appointment.status === "follow-up") badgeColor = "blue";
        else if (appointment.status === "declined") badgeColor = "outline";
        else if (appointment.status === "in-progress") badgeColor = "blue";

        appointmentHTML += `
            <div class="appt-row" onclick="openAppointment('${appointment.id}','patient')">
                <div style="display:flex;align-items:center;gap:10px; width:60%;">
                    <div class="avatar av-blue" style="width:34px;height:34px;font-size:11px;border-radius:8px;">
                        ${appointment.doctor_name.split(" ").map(n => n[0]).join("").toUpperCase()}
                    </div>
                    <div >
                        <div style="font-size:13px;font-weight:500;">
                            Dr. ${appointment.doctor_name}
                        </div>
                        <div class="multiline-truncate" style="font-size:12px;color:var(--text-secondary);">
                            ${appointment.reason || "Consultation"} 
                        </div>
                    </div>
                </div>

                <!-- <button 
                    class="badge badge-${badgeColor}" 
                    ${appointment.status === "scheduled"
                ? `onclick="cancelAppointment('${appointment.id}')"`
                : "disabled"}
                >
                    ${appointment.status === "scheduled" ? "pending" : appointment.status}
                </button> -->
                <div class="sm-wrap">
                    <span class="badge">${appointment.appointment_date.split('T')[0]} </span>
                    <span style="text-transform: capitalize;" class="badge badge-${badgeColor}">
                    ${appointment.status === "scheduled" ? "pending approval" : appointment.status} </span>
                </div>
            </div>
        `
    });
    appointmentsCard.innerHTML = appointmentHTML
}

window.cancelAppointment = async function cancelAppointment(appointmentId) {

    const confirmed = confirm("Are you sure you want to cancel this appointment?");
    if (!confirmed) return;

    try {
        const res = await fetch(`"${API_BASE_URL}/api/user/cancel-appointment"`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "token": `${token}`
            },
            body: JSON.stringify({ appointmentId })
        });

        const data = await res.json();

        if (data.success) {
            alert("Appointment cancelled successfully");
            // Refresh the appointments list
            await loadAppointments()
        } else {
            alert(data.message || "Failed to cancel appointment");
        }
    } catch (error) {
        console.error("Cancel error:", error);
        alert("An error occurred. Please try again.");
    }
}

window.openAppointment = function openAppointment(apptid, role) {
    window.location.href = `appointment.html?apptid=${apptid}&role=${role}`;
}

const upcomingTab = document.getElementById("upcomingTab");
const historyTab = document.getElementById("historyTab");

upcomingTab.addEventListener("click", () => {
    currentTab = "upcoming";
    setActiveTab(upcomingTab);
    updateURL("upcoming");
    renderAppointments();
});

historyTab.addEventListener("click", () => {
    currentTab = "history";
    setActiveTab(historyTab);
    updateURL("history");
    renderAppointments();
});

function setActiveTab(activeBtn) {
    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
    activeBtn.classList.add("active");
}

function isUpcoming(status) {
    return ["scheduled", "confirmed", "in-progress","follow-up"].includes(status);
}

function isHistory(status) {
    return ["completed", "cancelled", "no-show", "declined"].includes(status);
}

function initTabFromURL() {
    const upcomingTab = document.getElementById("upcomingTab");
    const historyTab = document.getElementById("historyTab");

    if (currentTab === "history") {
        setActiveTab(historyTab);
    } else {
        setActiveTab(upcomingTab);
    }
}

function updateURL(tab) {
    const newURL = `appointments.html?tab=${tab}`;
    window.history.replaceState(null, "", newURL);
}
