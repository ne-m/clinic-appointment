import { getInitials } from "../data/user.js";

const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "signin.html";
}

const av = document.querySelector(".av");
const params = new URLSearchParams(window.location.search);
const doctorId = params.get("id");

getInitials(av)

let docDetails;
let dateStr;
const docInitials = document.getElementById("docInitials")
const docName = document.getElementById("docName")
const docSpec = document.getElementById("docSpec")
const docBio = document.getElementById("docBio")
// const docSpec = document.getElementById("docSpec")

async function fetchDoctorProfile(docId) {
    const res = await fetch(`https://clinic-appointment-4lxl.onrender.com/api/user/doctor/${docId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "token": `${token}`
        }
    });

    let data = await res.json();

    if (data.success) {
        return data.doctor;
    } else {
        console.log(data.message);
    }

}

async function loadDoctorProfile() {
    docDetails = await fetchDoctorProfile(doctorId)
    console.log(docDetails);
    renderDoctorProfile()
    renderCalendar();
    loadSlots(dateStr);
}

loadDoctorProfile();

function renderDoctorProfile() {
    docName.innerHTML = docDetails.first_name + " " + docDetails.last_name;
    docSpec.innerHTML = docDetails.specialization
    docBio.innerHTML = docDetails.bio
}

let selectedTime = null;

async function loadSlots(date) {
    if (!date) return;
    if (!docDetails) return;
    const res = await fetch(
        `https://clinic-appointment-4lxl.onrender.com/api/user/booked-slots/${doctorId}/${date}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "token": `${token}`
        }
    }
    );
    
    const data = await res.json();

    const bookedSlots = data.bookedSlots || [];

    const slotsContainer = document.getElementById("timeSlots");
    slotsContainer.innerHTML = "";

    let hasAvailable = false;

    let startHour = parseInt(docDetails.start_time.split(":")[0]);
    let endHour = parseInt(docDetails.end_time.split(":")[0]);

    for (let hour = startHour; hour < endHour; hour++) {
        const time = `${hour.toString().padStart(2, '0')}:00`;

        const slot = document.createElement("div");
        slot.classList.add("slot");
        slot.textContent = time;

        if (bookedSlots.includes(time)) {
            slot.classList.add("disabled");
            slot.textContent = `${time} — Booked`;
        } else {
            hasAvailable = true;
            slot.onclick = () => {
                document.querySelectorAll(".slot").forEach(s => s.classList.remove("selected"));
                slot.classList.add("selected");
                selectedTime = time;
            };
        }

        slotsContainer.appendChild(slot);
    }

    // Show "No slots available"
    if (!hasAvailable) {
        slotsContainer.innerHTML = `<p>No slots available for this date</p>`;
    }
}

const calendarEl = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");

let currentDate = new Date();
let selectedDate;

// today in local time
function getLocalToday() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function renderCalendar() {
    calendarEl.innerHTML = "";
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    monthYear.textContent = currentDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

    const today = getLocalToday(); // ✅ correct for Nairobi (UTC+3)

    for (let i = 0; i < firstDay; i++) calendarEl.innerHTML += "<div></div>";

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const div = document.createElement("div");
        div.classList.add("day");
        div.textContent = day;

        if (dateStr < today) {
            div.classList.add("disabled");
        } else {
            div.onclick = () => {
                document.querySelectorAll(".day").forEach(d => d.classList.remove("selected"));
                div.classList.add("selected");
                selectedDate = dateStr; //updates the shared variable
                loadSlots(dateStr);
            };
        }
        calendarEl.appendChild(div);
    }
}

document.getElementById("prevMonth").onclick = () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
};

document.getElementById("nextMonth").onclick = () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
};

document.getElementById("bookBtn").onclick = async () => {
    const date = selectedDate; // reads current value at click time, not at load time
    const reason = document.getElementById("reason").value;

    if (!date || !selectedTime) {
        alert("Please select a date and time");
        return;
    }

        if (!reason) {
        alert("Please enter a reason for visit");
        return;
    }

    try {
        const res = await fetch(`https://clinic-appointment-4lxl.onrender.com/api/user/book-appointment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "token": token
            },
            body: JSON.stringify({ docId: doctorId, slotDate: date, slotBooked: selectedTime, reason })
        });
        const data = await res.json();
        if (data.success) {
            alert("Appointment booked successfully!");
            window.location.href = "appointments.html";
        } else {
            alert(data.message);
        }
    } catch (err) {
        console.error(err);
        alert("Error booking appointment");
    }
};

