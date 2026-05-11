const params = new URLSearchParams(window.location.search);
const token = localStorage.getItem("token");
let API_BASE_URL = localStorage.getItem('apiMode') ? localStorage.getItem('apiMode') : 'https://clinic-appointment-4lxl.onrender.com';


const apptid = params.get("apptid");
const role = params.get("role")
let apptDetails;


const docInitials = document.getElementById("docInitials")
const docName = document.getElementById("docName")
const docSpec = document.getElementById("docSpec")

const apptDate = document.getElementById("apptDate")
const apptTime = document.getElementById("apptTime")
const apptPatient = document.getElementById("apptPatient")
const apptBooked = document.getElementById("apptBooked")
const apptReason = document.getElementById("apptReason")
const statusBanner = document.getElementById("statusBanner")
const patientActionsStack = document.getElementById("patientActionsStack")
const apptId = document.getElementById("apptId")
const notesViewMode = document.getElementById("notesViewMode")

async function fetchAppointment(apptid, role) {
    const res = await fetch(`${API_BASE_URL}/api/user/appointment/${apptid}/${role}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "token": `${token}`
        }
    });

    let data = await res.json();

    if (data.success) {
        // console.log(data.appointmentData);
        return data.appointmentData
    } else {
        document.querySelector(".grid-2").innerHTML = data.message;
        // return data.message
    }
}

async function loadApptDetails() {
    apptDetails = await fetchAppointment(apptid, role)
    // console.log(apptDetails);
    
    if (apptDetails) {
        renderApptDetails()
        renderTimeline()
    } 
}

loadApptDetails()

async function renderApptDetails() {
    docName.innerHTML = apptDetails.doctor_name
    docSpec.innerHTML = apptDetails.specialization
    apptPatient.innerHTML = apptDetails.patient_name
    apptDate.innerHTML = apptDetails.appointment_date.split('T')[0]
    apptTime.innerHTML = apptDetails.slot_time
    apptBooked.innerHTML = apptDetails.created_at.split('T')[0]
    apptReason.innerHTML = apptDetails.reason
    apptId.innerHTML = apptDetails.id
    const cfg = STATUS_CFG[apptDetails.status];

    statusBanner.innerHTML = `
        <div class="banner-left">
            <div class="banner-icon" id="bannerIcon" style="background: rgba(217, 119, 6, 0.12);">
            ${cfg.iconSvg}</div>
            <div>
                <div class="banner-title" id="bannerTitle">${cfg.label}</div>
                <div class="banner-sub" id="bannerSub">${cfg.sub}</div>
            </div>
        </div>
        <span class="badge badge-${apptDetails.status}" id="statusBadge">${cfg.label}</span>
    `
    statusBanner.classList.add(`${cfg.cls}`)
    // console.log(apptDetails);


    if (apptDetails.status === "cancelled" || apptDetails.status === "no-show" || apptDetails.status === "in-progress") {
        patientActionsStack.innerHTML = '<p style="font-size:13px;color:var(--text-3);text-align:center;padding:8px 0;">No further actions available.</p>'
        // patientActionsStack.classList.add("cancelled")

    }

    if (apptDetails.status === "scheduled" || apptDetails.status === "confirmed") {
        // patientActionsStack.classList.remove("cancelled")
        patientActionsStack.innerHTML = `
            <div class="cancel-zone">
                <p>Cancelling will free up this slot for another patient. You can rebook at any time.</p>
                <button class="action-btn btn-red" onclick="openModal()">
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
                    </svg> Cancel appointment
                </button>
            </div>`
    }

    if (apptDetails.notes.length > 0) {
        const notes = apptDetails.notes
        let noteHTML = ""
        notes.forEach((note) => {
            noteHTML += `
                <p id="notesDisplay" style="font-size:13px;color:var(--text-3);line-height:1.7;font-style:italic;"> ${note.note}</p>
            `
        })
        notesViewMode.innerHTML = noteHTML
    }
}

const STATUS_CFG = {
    scheduled: {
        label: "Pending confirmation",
        sub: "Awaiting the doctor's confirmation",
        cls: "pending", badge: "badge-outline",
        iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#D97706" stroke-width="1.8"/><path d="M12 7v5l3 3" stroke="#D97706" stroke-width="1.8" stroke-linecap="round"/></svg>`,
        iconBg: "rgba(217,119,6,.12)",
    },
    confirmed: {
        label: "Appointment confirmed",
        sub: "The doctor has accepted your appointment",
        cls: "confirmed", badge: "badge-confirmed",
        iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#1D9E75" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        iconBg: "rgba(29,158,117,.12)",
    },
    "in-progress": {
        label: "In progress",
        sub: "Appointment is currently ongoing",
        cls: "inprogress", badge: "badge-inprogress",
        iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#2563EB" stroke-width="1.8"/><path d="M8 12h8" stroke="#2563EB" stroke-width="1.8" stroke-linecap="round"/></svg>`,
        iconBg: "rgba(37,99,235,.12)",
    },
    completed: {
        label: "Completed",
        sub: "This appointment has been completed",
        cls: "completed", badge: "badge-completed",
        iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#64748B" stroke-width="1.8"/><path d="M8 12l3 3 5-5" stroke="#64748B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        iconBg: "rgba(100,116,139,.10)",
    },
    declined: {
        label: "Appointment declined",
        sub: "The doctor has declined this appointment",
        cls: "declined", badge: "badge-declined",
        iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="hsl(0, 0%, 100%)" stroke-width="2" stroke-linecap="round"/></svg>`,
        iconBg: "rgba(220,38,38,.10)",
    },
    "no-show": {
        label: "Patient did not show",
        sub: "Marked as no-show by the doctor",
        cls: "noshow", badge: "badge-noshow",
        iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#7C3AED" stroke-width="1.8"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#7C3AED" stroke-width="1.8" stroke-linecap="round"/></svg>`,
        iconBg: "rgba(124,58,237,.10)",
    },
    cancelled: {
        label: "Appointment cancelled",
        sub: "This appointment was cancelled by the patient",
        cls: "cancelled", badge: "badge-cancelled",
        iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#DC2626" stroke-width="2" stroke-linecap="round"/></svg>`,
        iconBg: "rgba(220,38,38,.10)",
    },"follow-up": {
        label: "Follow Up Appointment",
        sub: "The doctor has set this appointment as a follow up",
        cls: "pending", badge: "badge-outline",
        iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#D97706" stroke-width="1.8"/><path d="M12 7v5l3 3" stroke="#D97706" stroke-width="1.8" stroke-linecap="round"/></svg>`,
        iconBg: "rgba(217,119,6,.12)",
    },
};


function ico(name) {
    const icons = {
        check: `<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        x: `<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
        play: `<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M5 3l9 5-9 5V3z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
        noshow: `<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" stroke-width="1.4"/><path d="M2 15c0-3 2.7-5 6-5s6 2 6 5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
        cal: `<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="11" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M5 1v4M11 1v4M1 7h14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
    };
    return icons[name] || "";
}
let pendingAction = null;

window.openModal = function openModal() {
    document.getElementById("modalOverlay").classList.add("open")
}
window.closeModal = function closeModal() {
    document.getElementById("modalOverlay").classList.remove("open");
}

document.getElementById("modalOverlay").addEventListener("click", e => {
    if (e.target === e.currentTarget) closeModal();
});

document.getElementById("modalConfirm").addEventListener("click", () => {
    cancelAppointment(apptDetails.id)
    document.getElementById("modalOverlay").classList.remove("open");
})

window.cancelAppointment = async function cancelAppointment(appointmentId) {
    try {
        const res = await fetch(`${API_BASE_URL}/api/user/cancel-appointment`, {
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
            // appointmentHTML = "";
            loadApptDetails();
        } else {
            alert(data.message || "Failed to cancel appointment");
        }
    } catch (error) {
        console.error("Cancel error:", error);
        alert("An error occurred. Please try again.");
    }
}

window.showToast = function showToast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 3000);
}

const TL_STEPS = [
    { key: "pending", label: "Booking submitted", icon: "📋", activeCls: "" },
    { key: "confirmed", label: "Confirmed by doctor", icon: "✓", activeCls: "" },
    { key: "in-progress", label: "In progress", icon: "▶", activeCls: "" },
    { key: "completed", label: "Completed", icon: "✓", activeCls: "" },
    { key: "declined", label: "Declined", icon: "✕", activeCls: "skipped" },
    { key: "no-show", label: "No-show", icon: "!", activeCls: "purple" },
    { key: "cancelled", label: "Cancelled", icon: "✕", activeCls: "skipped" },
    { key: "follow-up", label: "Follow-up", icon: "✓✓", activeCls: "follow-up" },
];

function timelineStepsFor(status) {
    if (status === "declined") return ["pending", "declined"];
    if (status === "no-show") return ["pending", "confirmed", "no-show"];
    if (status === "cancelled") return ["pending", "cancelled"];
    if (status === "in-progress") return ["pending", "confirmed", "in-progress"];
    if (status === "completed") return ["pending", "confirmed", "in-progress", "completed"];
    if (status === "confirmed") return ["pending", "confirmed"];
    if (status === "follow-up") return ["pending", "confirmed", "in-progress", "completed", "follow-up"];
    return ["pending"];
}

function renderTimeline() {
    const steps = timelineStepsFor(apptDetails.status);
    const lastKey = steps[steps.length - 1];
    const container = document.getElementById("timeline");

    container.innerHTML = steps.map(key => {
        const def = TL_STEPS.find(s => s.key === key);
        const isActive = key === lastKey;
        const isDone = !isActive;
        let cls = "tl-item";
        if (isDone) cls += " done";
        if (isActive) cls += " active";
        if (isActive && def.activeCls) cls += " " + def.activeCls;

        const now = new Date().toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });
        const timeLabel = isActive ? `Updated · ${now}` : "Completed";

        return `<div class="${cls}">
                    <div class="tl-dot">${def.icon}</div>
                    <div>
                        <div class="tl-title">${def.label}</div>
                        <div class="tl-time">${timeLabel}</div>
                    </div>
                </div>`;
    }).join("");
}