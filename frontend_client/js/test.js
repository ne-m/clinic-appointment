// Function to cancel appointment
async function cancelAppointment(appointmentId) {
    const token = localStorage.getItem("token");
    
    if (!token) {
        window.location.href = "signin.html";
        return;
    }
    
    const confirmed = confirm("Are you sure you want to cancel this appointment?");
    if (!confirmed) return;
    
    try {
        const res = await fetch("http://localhost:4000/api/appointments/cancel", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ appointmentId })
        });
        
        const data = await res.json();
        
        if (data.success) {
            alert("Appointment cancelled successfully");
            // Refresh the appointments list
            fetchAppointments();
        } else {
            alert(data.message || "Failed to cancel appointment");
        }
    } catch (error) {
        console.error("Cancel error:", error);
        alert("An error occurred. Please try again.");
    }
}

// Function to render appointments
function renderAppointments(appointments) {
    const container = document.getElementById("appointmentsContainer");
    
    if (!appointments || appointments.length === 0) {
        container.innerHTML = '<div class="no-appointments">No appointments found</div>';
        return;
    }
    
    container.innerHTML = appointments.map(appointment => {
        // Determine badge color based on status
        let badgeColor = "red"; // default
        if (appointment.status === "scheduled") badgeColor = "green";
        else if (appointment.status === "confirmed") badgeColor = "blue";
        else if (appointment.status === "completed") badgeColor = "gray";
        else if (appointment.status === "cancelled") badgeColor = "red";
        else if (appointment.status === "no-show") badgeColor = "orange";
        
        // Make badge clickable only if status is 'scheduled'
        const isClickable = appointment.status === "scheduled";
        const clickableClass = isClickable ? "clickable-badge" : "";
        const onClickAttr = isClickable ? `onclick="cancelAppointment('${appointment.id}')"` : "";
        
        return `
            <div class="appt-row">
                <div style="display:flex;align-items:center;gap:10px;">
                    <div class="avatar av-blue" style="width:34px;height:34px;font-size:11px;border-radius:8px;">DM</div>
                    <div>
                        <div style="font-size:13px;font-weight:500;">Dr. ${appointment.doctor_name}</div>
                        <div style="font-size:12px;color:var(--text-secondary);">General checkup · ${appointment.appointment_date.split('T')[0]}</div>
                    </div>
                </div>
                <span class="badge badge-${badgeColor} ${clickableClass}" ${onClickAttr}>${appointment.status}</span>
            </div>
        `;
    }).join('');
}

// Fetch appointments from API
async function fetchAppointments() {
    const token = localStorage.getItem("token");
    
    if (!token) {
        window.location.href = "signin.html";
        return;
    }
    
    try {
        const res = await fetch("http://localhost:4000/api/appointments/my-appointments", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        
        const data = await res.json();
        
        if (data.success) {
            renderAppointments(data.appointments);
        } else {
            console.error("Error fetching appointments:", data.message);
            document.getElementById("appointmentsContainer").innerHTML = 
                `<div class="error-message">${data.message}</div>`;
        }
    } catch (error) {
        console.error("Fetch error:", error);
        document.getElementById("appointmentsContainer").innerHTML = 
            '<div class="error-message">Failed to load appointments</div>';
    }
}

// Call this when page loads
fetchAppointments();