import { getInitials } from "../data/user.js";
// check for token
const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "signin.html";
}

const av = document.querySelector(".av");
const appointmentsCard = document.querySelector(".card")
let appointmentHTML = `<p class="section-label" style="margin-bottom:12px;">Appointment history</p>`
getInitials(av)

let appointments;

async function fetchAppointments() {
    try {
        const res = await fetch("https://clinic-appointment-4lxl.onrender.com/api/user/appointments", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "token": `${token}`
            }
        });

        let data = await res.json();

        if (data.success) {
            appointments = data.appointmentData
            // console.log(appointments);
            renderAppointments()
        } else {
            console.log(data.message);
        }
    } catch (error) {
        console.error(error);
        appointmentsCard.innerHTML = `<div class="error-message">Failed to load appointments</div>`
    }
}

async function loadAppointments() {
    appointments = await fetchAppointments()
    // renderAppointments()
}

loadAppointments()

function renderAppointments() {
    if (!appointments || appointments.length === 0) {
        appointmentsCard.innerHTML = '<div class="no-appointments">No appointments found</div>';
        return;
    }

    appointments.forEach((appointment) => {
        let badgeColor = "red"; // default
        if (appointment.status === "scheduled") badgeColor = "green";
        else if (appointment.status === "confirmed") badgeColor = "blue";
        else if (appointment.status === "completed") badgeColor = "gray";
        else if (appointment.status === "cancelled") badgeColor = "red";
        else if (appointment.status === "no-show") badgeColor = "orange";
        else if (appointment.status === "declined") badgeColor = "outline";

        appointmentHTML += `
            <div class="appt-row" onclick="openAppointment('${appointment.id}','patient')">
                <div style="display:flex;align-items:center;gap:10px;">
                    <div class="avatar av-blue" style="width:34px;height:34px;font-size:11px;border-radius:8px;">
                        ${appointment.doctor_name.split(" ").map(n => n[0]).join("").toUpperCase()}
                    </div>
                    <div>
                        <div style="font-size:13px;font-weight:500;">
                            Dr. ${appointment.doctor_name}
                        </div>
                        <div style="font-size:12px;color:var(--text-secondary);">
                            ${appointment.reason || "Consultation"} · ${appointment.appointment_date.split('T')[0]}
                        </div>
                    </div>
                </div>

                <!-- <button 
                    class="badge badge-${badgeColor}" 
                    ${appointment.status === "scheduled"
                ? `onclick="cancelAppointment('${appointment.id}')"`
                : "disabled"}
                >
                    ${appointment.status}
                </button> -->

                <span class="badge badge-${badgeColor}">${appointment.status} </span>
            </div>
        `
    });
    appointmentsCard.innerHTML = appointmentHTML
}

window.cancelAppointment = async function cancelAppointment(appointmentId) {

    const confirmed = confirm("Are you sure you want to cancel this appointment?");
    if (!confirmed) return;

    try {
        const res = await fetch("https://clinic-appointment-4lxl.onrender.com/api/user/cancel-appointment", {
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
            appointmentHTML = "";
            loadAppointments();
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


