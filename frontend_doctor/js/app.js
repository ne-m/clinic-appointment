import { hideLoading, showLoadingError } from "./loader.js";
const dtoken = localStorage.getItem("dtoken");

if (!dtoken) {
    window.location.href = "signin.html";
}

const doctorList = document.querySelector(".doctor-list")

let doctors;
let doctorHTML = "";

let dashboard;
let dashboardHTML = "";
const appointmentCount = document.querySelector(".appointment-count")
const patientCount = document.querySelector(".patient-count")
const changeAvailabilityBtn = document.querySelector(".change-availability-btn")
const docstatusSpan = document.querySelector(".doctor-status")
const availabilityBtnContainer = document.querySelector(".btn-container")

let appointments;
let appointmentHTML = ""
const appointmentCards = document.querySelector(".appointment-cards")

let currentTab = "upcoming";


async function loadDashboard() {
    doctorHTML = ""
    dashboardHTML = ""
    appointmentHTML = ""
    dashboard = await fetchDashboard()
    appointments = await fetchAppointments()
    hideLoading()
    document.querySelector(".dash-panel").style.display="block"
    renderDashboard()
    renderAppointments()
}
loadDashboard()

window.changeAvailabilityBtn = function changeAvailabilityBtn(){
    function parseJwt(dtoken) {
        return JSON.parse(atob(dtoken.split('.')[1]));
    }
    let { id } = parseJwt(dtoken)

    changeAvailability(id)

}

async function changeAvailability(docID) {
    const confirmed = confirm(`Are you sure you want to change availability for id: ${docID}`);
    if (!confirmed) return;

    try {
        const res = await fetch("https://clinic-appointment-4lxl.onrender.com/api/doctor/change-availability", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "dtoken": `${dtoken}`
            },
            body: JSON.stringify({ docID })
        });

        const data = await res.json();
        document.querySelector(".doctor-status").classList.remove("available")
        document.querySelector(".doctor-status").classList.remove("busy")

        if (data.success) {
            alert("Availability changed successfully");

            // data.availability.is_working ? document.querySelector(".doctor-status").classList.add("available") : document.querySelector(".doctor-status").classList.add("busy");
            // data.availability.is_working ? document.querySelector(".doctor-status").textContent = "Available" : document.querySelector(".doctor-status").textContent = "Not available"
            loadDashboard()
        } else {
            alert(data.message || "Failed to change availability");
        }
    } catch (error) {
        console.error("Cancel error:", error);
        alert("An error occurred. Please try again.");
    }
}

async function fetchDashboard() {
    const res = await fetch("https://clinic-appointment-4lxl.onrender.com/api/doctor/dashboard", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "dtoken": `${dtoken}`
        }
    });

    let data = await res.json();

    if (data.success) {
        return data.dashData;
    } else {
        console.log(data.message);
    }
}

function renderDashboard() {
    appointmentCount.innerHTML = dashboard.appointments
    patientCount.innerHTML = dashboard.patients

    availabilityBtnContainer.innerHTML = `
        <button class="btn-primary" onclick="changeAvailabilityBtn()">Change Availability</button>
        <span class="doctor-status ${dashboard.availability.is_working? 'available' : "busy"}">${dashboard.availability.is_working? 'Available' : "Busy"}</span>
    `
}

async function fetchAppointments() {
    const res = await fetch("https://clinic-appointment-4lxl.onrender.com/api/doctor/appointments", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "dtoken": `${dtoken}`
        }
    });

    let data = await res.json();

    if (data.success) {
        return data.appointments;
    } else {
        console.log(data.message);
    }
}

function renderAppointments() {
    appointmentHTML = `
        <div >
            <p class="section-label" style="margin-bottom:12px; font-weight: bold;">Appointment history</p>
            <p class="section-label" style="margin-bottom:12px; font-size:14px;">Select an appointment to view more details</p>
        </div>
    `
    if (!appointments || appointments.length === 0) {
        appointmentCards.innerHTML = '<div class="no-appointments">No appointments found</div>';
        return;
    }

    let filtered = appointments.filter(a => {
        if (currentTab === "upcoming") {
            return isUpcoming(a.status);
        }
        if (currentTab === "history") { 
            return isHistory(a.status);
        }
    });

    if (filtered.length === 0) {
        appointmentCards.innerHTML = `<div>No ${currentTab} appointments</div>`;
        return;
    }

    filtered.forEach(appointment => {

        let badgeColor = "red";
        if (appointment.status === "scheduled") badgeColor = "amber";
        else if (appointment.status === "confirmed") badgeColor = "blue";
        else if (appointment.status === "completed") badgeColor = "green";
        else if (appointment.status === "cancelled") badgeColor = "red";
        else if (appointment.status === "no-show") badgeColor = "purple";
        else if (appointment.status === "follow-up") badgeColor = "amber";
        else if (appointment.status === "declined") badgeColor = "outline";
        else if (appointment.status === "in-progress") badgeColor = "blue";

        // appointmentHTML += `
        //     <div class="appt-row" onclick="openAppointment('${appointment.id}','doctor')">
        //         <div>
        //             <div style="font-size:13px;font-weight:500;">${appointment.patient_name}</div>
        //             <div style="font-size:12px;color:var(--text-secondary)">${appointment.reason}</div>
        //         </div>
        //         <span style="color:var(--text-secondary)">
        //             ${formatDate(appointment.appointment_date)} · ${appointment.slot_time}
        //         </span>
        //         ${appointment.status === "scheduled" ?
        //         `<div class="row-flex" style="gap:6px">
        //             <button class="btn-primary" onclick="confirmAppt('${appointment.id}','confirmed')"  >Confirm</button>
        //             <button class="btn-outline" onclick="declineAppt('${appointment.id}','declined')">Decline</button>
        //         </div>` :
        //         `<span class="badge badge-${badgeColor}">${appointment.status}</span>`

        //     }
        //     </div>`

        appointmentHTML += `
            <div class="appt-row" onclick="openAppointment('${appointment.id}','doctor')">
                <div style="display:flex; flex-direction:column; width:60%;">
                
                        <div style="font-size:13px;font-weight:500;">${appointment.patient_name}</div>
                        <div style="font-size:12px; color:var(--text-secondary);" class="multiline-truncate">${appointment.reason}</div>
                    
                </div>
                
                <div style="display:flex; flex-direction:column; justify-content: center; align-items: center;  gap:10px;">
                    <div style="font-size:13px;font-weight:500;" >
                        ${formatDate(appointment.appointment_date)} 
                    </div>
                    <div style="font-size:12px;color:var(--text-secondary)" >
                        ${appointment.slot_time} 
                    </div>
                </div>

                <div style="display:flex; flex-direction:column; justify-content: center; align-items: center;  gap:5px;" >
                    <span class="badge">${appointment.appointment_date.split('T')[0]} </span>
                    <span style="text-transform: capitalize;" class="badge badge-${badgeColor}">
                    ${appointment.status === "scheduled" ? "pending" : appointment.status} </span>
                </div>
            </div>
        `
    })
    appointmentCards.innerHTML = appointmentHTML;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short"
    });
}

window.confirmAppt = async function confirmAppt(appointmentId, status) {
    const confirmed = confirm("Are you sure you want to confirm this appointment?");
    if (!confirmed) return;

    try {
        const res = await fetch("https://clinic-appointment-4lxl.onrender.com/api/doctor/appointment-status", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "dtoken": `${dtoken}`
            },
            body: JSON.stringify({ appointmentId, status })
        });

        const data = await res.json();

        if (data.success) {
            alert("Appointment confirmed successfully");
            appointmentHTML = "";
            loadDashboard();
        } else {
            alert(data.message || "Failed to confirm the appointment");
        }
    } catch (error) {
        console.error("Cancel error:", error);
        alert("An error occurred. Please try again.");
    }
}

window.declineAppt = async function declineAppt(appointmentId, status) {
    const confirmed = confirm("Are you sure you want to decline this appointment?");
    if (!confirmed) return;

    try {
        const res = await fetch("https://clinic-appointment-4lxl.onrender.com/api/doctor/appointment-status", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "dtoken": `${dtoken}`
            },
            body: JSON.stringify({ appointmentId, status })
        });

        const data = await res.json();

        if (data.success) {
            alert("Appointment declined successfully");
            loadDashboard();
        } else {
            alert(data.message || "Failed to decline the appointment");
        }
    } catch (error) {
        console.error("Cancel error:", error);
        alert("An error occurred. Please try again.");
    }
}

window.openAppointment = function openAppointment(apptid, role) {
    window.location.href = `appointment.html?apptid=${apptid}&role=${role}`;
}

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
    return ["scheduled", "confirmed", "in-progress", "follow-up"].includes(status);
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
    const newURL = `index.html?tab=${tab}`;
    window.history.replaceState(null, "", newURL);
}