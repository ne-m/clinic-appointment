import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

//change availability by the admin
const changeAvailability = async (req, res) => {
    try {
        const { docID } = req.body
        const updateAvailability = await pool.query("UPDATE doctors SET is_working = NOT is_working WHERE user_id = $1 RETURNING is_working, user_id;", [docID])
        const availability = updateAvailability.rows[0]
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

//follow up appointment
const followUpAppointment = async (req, res) => {

    try {


        const { status, parentId, doctorId, patientId, slotDate, slotBooked, reason } = req.body;
        const docId = req.doctor.id

        console.log(status,"parent", parentId,"docid",doctorId, "patient",patientId, "date",slotDate,"time", slotBooked , reason);


        if (docId !== doctorId) {
            res.json({ success: false, message: "Unauthorized access!" })
        }

        // Verify parent appointment exists and is completed
        if (status === 'followup') {
            const parent = await db.query(
                'SELECT id, status FROM appointment WHERE id = $1', [parentId]
            );
            if (!parent.rows.length || parent.rows[0].status !== 'completed') {
                return res.status(400).json({ error: 'Parent appointment not found or not completed' });
            }
        }

        // Check the slot isn't already taken
        const conflict = await pool.query(
            `SELECT id FROM appointment
        WHERE doctor_id = $1
        AND appointment_date::date = $2
        AND slot_time = $3
        AND status NOT IN ('cancelled','declined')`,
            [doctorId, slotDate, slotBooked]
        );
        if (conflict.rows.length) {
            return res.status(409).json({ error: 'That slot is already booked' });
        }

        const result = await pool.query(
            `INSERT INTO appointment
        (doctor_id, patient_id, appointment_date, slot_time, status,
        parent_appointment_id, reason)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id`,
            [
                doctorId,
                patientId,
                `${slotDate}T${slotBooked}`,
                slotBooked,
                'follow-up',
                status === 'follow-up' ? parentId : null,
                reason
            ]
        );

        res.json({ appointmentId: result.rows[0].id });

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
        const availability = await pool.query(`SELECT is_working FROM doctors WHERE user_id=$1`, [doctorId])

        let patients = []
        // console.log(availability);        

        appointments.map((appointment) => {
            if (!patients.includes(appointment.patient_id)) {
                patients.push(appointment.patient_id)
            }
        })

        const dashData = {
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: latestAppointments.rows, //reverse
            availability: availability.rows[0]
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
        const docId = req.doctor.id

        const notAppt = await pool.query("SELECT * FROM appointment WHERE id=$1 AND doctor_id=$2", [apptid, docId])
        if (notAppt.rows.length === 0) {
            res.json({ success: false, message: 'Appointment not found!' });
        }

        const appointmentDB = await pool.query(`
            SELECT 
                a.*,
                d_u.first_name || ' ' || d_u.last_name AS doctor_name,
                d_u.image AS doctor_image,
                d.specialization,
                p.first_name || ' ' || p.last_name AS patient_name,
                p.image AS patient_image,
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
            JOIN doctors d ON a.doctor_id = d.user_id
            JOIN users d_u ON d.user_id = d_u.id
            JOIN users p ON a.patient_id = p.id
            LEFT JOIN appointment_note n ON n.appointment_id = a.id
            WHERE a.id = $1
            GROUP BY 
                a.id,
                d_u.first_name, d_u.last_name,
                d_u.image,  
                d.specialization,
                p.first_name, p.last_name,
                p.image     
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

export { changeAvailability, doctorList, loginDoctor, appointmentsDoctor, appointmentStatus, doctorDashboard, doctorProfile, updateDoctorProfile, appointmentDetails, addAppointmentNote, followUpAppointment };