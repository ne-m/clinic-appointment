import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

//change availability by the admin
const changeAvailability = async (req, res) => {
    try {
        const { docID } = req.body
        const updateAvailability = await pool.query("UPDATE doctors SET is_working = NOT is_working WHERE user_id = $1 RETURNING is_working, user_id;", [docID])
        const availability = updateAvailability.rows[0]
        console.log(availability);

        res.json({ success: true, message: `Availability changed`, availability });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message })
    }
}

const doctorList = async (req, res) => {
    try {
        const doctorsDB = await pool.query("SELECT u.id AS user_id, u.first_name, u.last_name, u.phone, u.image, u.created_at, d.user_id AS doctor_id, d.specialization, d.bio, d.start_time, d.end_time, d.day_of_week, d.is_working, d.created_at AS doctor_active FROM users u INNER JOIN doctors d ON u.id = d.user_id WHERE u.role = 'doctor'")
        const doctors = doctorsDB.rows
        res.json({ success: true, doctors })

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message })
    }
}

//login doc
const loginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body

        const doctor = await pool.query("SELECT * FROM users WHERE email = $1 AND role = 'doctor'", [email]);
        const doctorDetails = doctor.rows[0];

        if (!doctorDetails) {
            res.json({ success: false, message: "Invalid credentials" })
        }

        const isMatch = await bcrypt.compare(password, doctorDetails.password_hash)
        if (isMatch) {
            const token = jwt.sign({ id: doctorDetails.id }, process.env.JWT_SECRET);
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" });
        }

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message })
    }
}

//doctor appointment for doc panel
const appointmentsDoctor = async (req, res) => {
    try {
        const doctorId = req.doctor.id

        // const appointmentsDB = await pool.query("SELECT * FROM appointment WHERE doctor_id = $1", [doctorId])
        const appointmentsDB = await pool.query(`
            SELECT 
                a.*,
                p.first_name || ' ' || p.last_name AS patient_name
                -- d_u.first_name || ' ' || d_u.last_name AS doctor_name

            FROM appointment a

            JOIN users p ON a.patient_id = p.id
            JOIN doctors d ON a.doctor_id = d.user_id
            JOIN users d_u ON d.user_id = d_u.id
    WHERE d.user_id= $1
    ORDER BY a.appointment_date DESC`, [doctorId])
        const appointments = appointmentsDB.rows;

        res.json({ success: true, appointments })

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message })
    }
}

//appointment status
const appointmentStatus = async (req, res) => {
    try {
        const { appointmentId, status } = req.body

        const appointmentDB = await pool.query("UPDATE appointment SET status=$1 WHERE id=$2", [status, appointmentId]);
        const appointment = appointmentDB.rows[0]
        console.log(appointment);

        res.json({ success: true, message: `Appointment status changed`, appointment });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message })
    }
}

//doctor dashboard
const doctorDashboard = async (req, res) => {
    try {
        const doctorId = req.doctor.id;
        const appointmentsDB = await pool.query("SELECT * FROM appointment WHERE doctor_id = $1", [doctorId]);
        const appointments = appointmentsDB.rows
        const latestAppointments = await pool.query(`SELECT * FROM appointment WHERE doctor_id = $1 ORDER BY appointment_date DESC, slot_time DESC LIMIT 5;`, [doctorId]);

        let patients = []

        appointments.map((appointment) => {
            if (!patients.includes(appointment.patient_id)) {
                patients.push(appointment.patient_id)
            }
        })

        const dashData = {
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: latestAppointments.rows //reverse
        };

        res.json({ success: true, dashData });


    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message })
    }
}

//doc profile for doc panel
const doctorProfile = async (req, res) => {
    try {
        const doctorId = req.doctor.id;
        const doctorDB = await pool.query("SELECT u.id AS user_id, u.first_name, u.last_name, u.email, u.phone, u.image, u.created_at, d.user_id AS doctor_id, d.specialization, d.bio, d.start_time, d.end_time, d.day_of_week, d.is_working FROM users u INNER JOIN doctors d ON u.id = d.user_id WHERE u.id = $1;", [doctorId]);
        const profileData = doctorDB.rows[0];
        res.json({ success: true, profileData })

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message })
    }
}

//update doc profile from doc panel
const updateDoctorProfile = async (req, res) => {
    try {
        const doctorId = req.doctor.id;
        const { first_name, last_name, email, phone, start_time, end_time, bio } = req.body;

        // const updateAvailability = await pool.query("UPDATE doctors SET is_working = $1 WHERE user_id = $2 RETURNING is_working, user_id", [!isWorking, doctorId])
        const updateDoctorDB = await pool.query("UPDATE doctors SET start_time = $1, end_time=$2, bio=$3 WHERE user_id=$4", [start_time, end_time, bio, doctorId])
        const updateDoctorUserDB = await pool.query("UPDATE users SET first_name=$1, last_name=$2, email=$3, phone=$4 WHERE id=$5", [first_name, last_name, email, phone, doctorId])

        res.json({ success: true, message: `Profile updated` });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message })
    }
}

const appointmentDetails = async (req, res) => {
    try {
        const { apptid, role } = req.params;
        console.log(apptid, role);

        const userId = req.doctor.id
        const appointmentDB = await pool.query(`
    SELECT 
        a.*,

        -- Doctor
        d_u.first_name || ' ' || d_u.last_name AS doctor_name,
        d.specialization,

        -- Patient
        p.first_name || ' ' || p.last_name AS patient_name,

        -- Notes (array of notes)
        COALESCE(
            json_agg(
                json_build_object(
                    'note', n.note,
                    'created_at', n.created_at
                )
            ) FILTER (WHERE n.id IS NOT NULL),
            '[]'
        ) AS notes

    FROM appointment a

    -- Doctor joins
    JOIN doctors d ON a.doctor_id = d.user_id
    JOIN users d_u ON d.user_id = d_u.id

    -- Patient join
    JOIN users p ON a.patient_id = p.id

    -- Notes (LEFT JOIN because may not exist)
    LEFT JOIN appointment_note n ON n.appointment_id = a.id

    WHERE a.id = $1

    GROUP BY 
        a.id,
        d_u.first_name, d_u.last_name,
        d.specialization,
        p.first_name, p.last_name
`, [apptid]);

        const appointmentData = appointmentDB.rows[0];

        res.json({ "success": true, appointmentData })
    } catch (error) {
        console.error(error);
        res.json({
            success: false,
            message: error.message
        });

    }
}

const addAppointmentNote = async (req, res) => {
    try {
        const { apptid } = req.params
        const { note } = req.body
        const doctorId = req.doctor.id

        if (!note || note.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Not complete"
            });
        }

        const apptCheck = await pool.query(
            "SELECT * FROM appointment WHERE id = $1 AND doctor_id = $2",
            [apptid, doctorId]
        );

        if (apptCheck.rows.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized access"
            });
        }


        const newNote = await pool.query(
            `INSERT INTO appointment_note (appointment_id, doctor_id, note)
            VALUES ($1, $2, $3)
             RETURNING *`,
            [apptid, doctorId, note]
        );

    } catch (error) {
        console.error(error);
        res.json({
            success: false,
            message: error.message
        });
    }
}

export { changeAvailability, doctorList, loginDoctor, appointmentsDoctor, appointmentStatus, doctorDashboard, doctorProfile, updateDoctorProfile, appointmentDetails, addAppointmentNote };