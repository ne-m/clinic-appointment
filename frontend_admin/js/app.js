const doctorList = document.querySelector(".doctor-list")

let doctors;
let doctorHTML = "";

let dashboard;
let dashboardHTML = "";
const doctorCount = document.querySelector(".doctor-count")
const appointmentCount = document.querySelector(".appointment-count")
const patientCount = document.querySelector(".patient-count")

let appointments;
let appointmentHTML = ""
const appointmentCards = document.querySelector(".appointment-cards")

async function fetchDoctors() {
    const res = await fetch("http://localhost:4000/api/admin/all-doctors", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
            // "token": `${token}`
        }
    });

    let data = await res.json();

    if (data.success) {
        return data.doctors;
    } else {
        console.log(data.message);
    }
}

async function loadDashboard() {
    doctors = await fetchDoctors()
    dashboard = await fetchDashboard()
    appointments = await fetchAppointments()
    renderDoctors()
    renderDashboard()
    renderAppointments()
    // console.log(doctors);
    // console.log(dashboard);
    console.log(appointments);

}
loadDashboard()

function renderDoctors() {
    doctors.forEach(doctor => {
        doctorHTML += `                
            <div class="doctor-card">
                <img src=${doctor.image} class="doctor-img" alt="Doctor">

                <div class="doctor-info">
                    <h3 class="doctor-name">${doctor.first_name + " " + doctor.last_name}</h3>
                    <p class="doctor-spec">General Practitioner</p>

                    <div class="doctor-meta">
                        <span class="doctor-rating">⭐ <i>To do</i> </span>
                        <span class="doctor-status ${doctor.is_working ? "available" : "busy"} ">${doctor.is_working ? "Available" : "Not available"}</span>
                    </div>

                    <div class="btn-container">
                        <button class="btn-primary" onclick="changeAvailability('${doctor.doctor_id}')" >Change Availability</button>                    
                        <button class="btn-danger" onclick="deleteDoctor('${doctor.doctor_id}')">Remove</button>
                    </div>
                    
                </div>
            </div>
                `
    })

    doctorList.innerHTML = doctorHTML
}

window.changeAvailability = async function changeAvailability(docID) {
    const confirmed = confirm(`Are you sure you want to change availability for id: ${docID}`);
    if (!confirmed) return;

    try {
        const res = await fetch("http://localhost:4000/api/admin/change-availability", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
                // "token": `${token}`
            },
            body: JSON.stringify({ docID })
        });

        const data = await res.json();

        if (data.success) {
            alert("Availability changed successfully");
            doctorHTML = ""

            loadDashboard()
        } else {
            alert(data.message || "Failed to change availability");
        }
    } catch (error) {
        console.error("Cancel error:", error);
        alert("An error occurred. Please try again.");
    }
}

window.deleteDoctor = async function deleteDoctor(docID) {
    const confirmed = confirm(`Are you sure you want to delete doctor id: ${docID}`);
    if (!confirmed) return;

    try {
        const res = await fetch("http://localhost:4000/api/admin/delete-doctor", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
                // "token": `${token}`
            },
            body: JSON.stringify({ docID })
        });

        const data = await res.json();

        if (data.success) {
            alert("Doctor successfully");
            doctorHTML = ""
            loadDashboard()
        } else {
            alert(data.message || "Failed to delete doctor");
        }
    } catch (error) {
        console.error("Cancel error:", error);
        alert("An error occurred. Please try again.");
    }
}

async function fetchDashboard() {
    const res = await fetch("http://localhost:4000/api/admin/dashboard", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
            // "token": `${token}`
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
    doctorCount.innerHTML = dashboard.doctors
    appointmentCount.innerHTML = dashboard.appointments
    patientCount.innerHTML = dashboard.patients
}

async function fetchAppointments() {
    const res = await fetch("http://localhost:4000/api/admin/appointments", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
            // "token": `${token}`
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
    appointments.forEach(appointment => {
        let badgeColor = "red"; // default
        if (appointment.status === "scheduled") badgeColor = "green";
        else if (appointment.status === "confirmed") badgeColor = "blue";
        else if (appointment.status === "completed") badgeColor = "gray";
        else if (appointment.status === "cancelled") badgeColor = "red";
        else if (appointment.status === "no-show") badgeColor = "orange";

        appointmentHTML += `
            <div class="appt-row">
                <span>${appointment.patient_name} → ${appointment.doctor_name}</span>
                <span style="color:var(--text-secondary)">
                    ${formatDate(appointment.appointment_date)} · ${appointment.slot_time}
                </span>
                <span class="badge badge-${badgeColor}">${appointment.status}</span>
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
