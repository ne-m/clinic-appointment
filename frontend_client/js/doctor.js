const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "signin.html";
}

const params = new URLSearchParams(window.location.search);
const doctorId = params.get("id");

console.log("Doctor ID:", doctorId);

let docDetails;
const docInitials = document.getElementById("docInitials")
const docName = document.getElementById("docName")
const docSpec = document.getElementById("docSpec")
const docBio = document.getElementById("docBio")
// const docSpec = document.getElementById("docSpec")

async function fetchDoctorProfile(docId) {
    // console.log(docId);

    const res = await fetch(`http://localhost:4000/api/user/doctor/${docId}`, {
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

    generateSlots(docDetails.start_time, docDetails.end_time);
    
}

loadDoctorProfile();

function renderDoctorProfile() {
    docName.innerHTML = docDetails.first_name + " " + docDetails.last_name;
    docSpec.innerHTML = docDetails.specialization
    docBio.innerHTML = docDetails.bio
}

let selectedTime = null;

function generateSlots(start, end) {
    const slotsContainer = document.getElementById("timeSlots");
    slotsContainer.innerHTML = "";

    let startHour = parseInt(start.split(":")[0]);
    let endHour = parseInt(end.split(":")[0]);

    for (let hour = startHour; hour < endHour; hour++) {
        const time = `${hour.toString().padStart(2, '0')}:00`;

        const slot = document.createElement("div");
        slot.classList.add("slot");
        slot.textContent = time;

        slot.onclick = () => {
            document.querySelectorAll(".slot").forEach(s => s.classList.remove("selected"));
            slot.classList.add("selected");
            selectedTime = time;
        };

        slotsContainer.appendChild(slot);
    }
}

document.getElementById("bookBtn").onclick = async () => {

    const date = document.getElementById("appointmentDate").value;
    const reason = document.getElementById("reason").value;

    if (!date || !selectedTime) {
        alert("Please select date and time");
        return;
    }

    try {
        const res = await fetch("http://localhost:4000/api/user/book-appointment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            "token": `${token}`
            },
            body: JSON.stringify({
                doctor_id: doctorId,
                appointment_date: date,
                slot_time: selectedTime,
                reason
            })
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