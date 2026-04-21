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

let appointments;
let appointmentHTML = ""
const appointmentCards = document.querySelector(".appointment-cards")


async function loadDashboard() {
    doctorHTML = ""
    dashboardHTML = ""
    appointmentHTML = ""
    dashboard = await fetchDashboard()
    appointments = await fetchAppointments()
    renderDashboard()
    renderAppointments()
    // console.log(appointments);

}
loadDashboard()

changeAvailabilityBtn.addEventListener("click", () => {
    function parseJwt(dtoken) {
        return JSON.parse(atob(dtoken.split('.')[1]));
    }
    let { id } = parseJwt(dtoken)

    changeAvailability(id)
})

async function changeAvailability(docID) {
    const confirmed = confirm(`Are you sure you want to change availability for id: ${docID}`);
    if (!confirmed) return;

    try {
        const res = await fetch("http://localhost:4000/api/doctor/change-availability", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "dtoken": `${dtoken}`
            },
            body: JSON.stringify({ docID })
        });

        const data = await res.json();
        console.log(data.availability.is_working);

        document.querySelector(".doctor-status").classList.remove("available")
        document.querySelector(".doctor-status").classList.remove("busy")

        if (data.success) {
            alert("Availability changed successfully");

            data.availability.is_working ? document.querySelector(".doctor-status").classList.add("available") : document.querySelector(".doctor-status").classList.add("busy");
            data.availability.is_working ? document.querySelector(".doctor-status").textContent = "Available" : document.querySelector(".doctor-status").textContent = "Not available"
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
    const res = await fetch("http://localhost:4000/api/doctor/dashboard", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "dtoken": `${dtoken}`
        }
    });

    let data = await res.json();

    if (data.success) {
        console.log(data.dashData);

        return data.dashData;
    } else {
        console.log(data.message);
    }
}

function renderDashboard() {
    appointmentCount.innerHTML = dashboard.appointments
    patientCount.innerHTML = dashboard.patients
}

async function fetchAppointments() {
    const res = await fetch("http://localhost:4000/api/doctor/appointments", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "dtoken": `${dtoken}`
        }
    });

    let data = await res.json();

    if (data.success) {
        // console.log(data.appointments);

        return data.appointments;
    } else {
        console.log(data.message);
    }
}

function renderAppointments() {
    appointments.forEach(appointment => {

        let badgeColor = "red";
        if (appointment.status === "scheduled") badgeColor = "green";
        else if (appointment.status === "confirmed") badgeColor = "blue";
        else if (appointment.status === "completed") badgeColor = "gray";
        else if (appointment.status === "cancelled") badgeColor = "red";
        else if (appointment.status === "no-show") badgeColor = "orange";
        else if (appointment.status === "declined") badgeColor = "outline";

        appointmentHTML += `
            <div class="appt-row">
                <div>
                    <div style="font-size:13px;font-weight:500;">${appointment.patient_name}</div>
                    <div style="font-size:12px;color:var(--text-secondary)">${appointment.reason}</div>
                </div>
                <span style="color:var(--text-secondary)">
                    ${formatDate(appointment.appointment_date)} · ${appointment.slot_time}
                </span>
                ${appointment.status === "scheduled" ?
                `<div class="row-flex" style="gap:6px">
                    <button class="btn-primary" onclick="confirmAppt('${appointment.id}','confirmed')"  >Confirm</button>
                    <button class="btn-outline" onclick="declineAppt('${appointment.id}','declined')">Decline</button>
                </div>` :
                `<span class="badge badge-${badgeColor}">${appointment.status}</span>`

            }
            </div>`
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

window.confirmAppt = async function confirmAppt(appointmentId,status) {
    const confirmed = confirm("Are you sure you want to confirm this appointment?");
    if (!confirmed) return;

    try {
        const res = await fetch("http://localhost:4000/api/doctor/appointment-status", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "dtoken": `${dtoken}`
            },
            body: JSON.stringify({ appointmentId,status })
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

window.declineAppt = async function declineAppt(appointmentId,status) {
    const confirmed = confirm("Are you sure you want to decline this appointment?");
    if (!confirmed) return;

    try {
        const res = await fetch("http://localhost:4000/api/doctor/appointment-status", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "dtoken": `${dtoken}`
            },
            body: JSON.stringify({ appointmentId,status })
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