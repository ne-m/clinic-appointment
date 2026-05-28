import pool from "../config/db.js";
import validator from "validator";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import 'dotenv/config';
import { v2 as cloudinary } from "cloudinary"
import streamifier from "streamifier";
import { json } from "express";

//api to register user
const registerUser = async (req, res) => {
    try {
        const { first_name, last_name, email, phone, password, role } = req.body;
        // const {dob,gender}= req.body;

        if (!first_name || !last_name || !email || !phone || !password || !role) {
            return res.json({ success: false, message: "Missing details" })
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Enter a valid email" })
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Password must be at least 8 characters" })
        }

        //hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = await pool.query("INSERT INTO users (first_name, last_name, email,phone, password_hash, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id", [first_name, last_name, email, phone, hashedPassword, role]);
        const userId = newUser.rows[0].id

        const token = jwt.sign(
            { id: userId }, process.env.JWT_SECRET
        )

        res.json({ success: true, token })

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message })
    }
}

//user login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        console.log(email, password);


        const { rows } = await pool.query("SELECT * FROM users WHERE email = $1 AND role = 'patient'", [email]);
        if (rows.length === 0) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const userDetails = rows[0];
        // console.log(userDetails);

        const isMatch = await bcrypt.compare(password, userDetails.password_hash)
        if (isMatch) {
            const token = jwt.sign({ id: userDetails.id }, process.env.JWT_SECRET);
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" });
        }

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message })
    }
}

//api to get user profile data
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log(userId);


        const data = await pool.query("SELECT u.id AS user_id, u.first_name, u.last_name, u.email, u.phone, u.image, u.created_at, p.user_id AS patient_id, p.gender, p.dob, p.address FROM users u LEFT JOIN patients p ON u.id = p.user_id WHERE u.id = $1", [userId]);
        const userData = data.rows[0]

        res.json({ success: true, userData });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message })
    }
}

//update user profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { first_name, last_name, email, phone, gender, dob, address } = req.body;

        if (!first_name || !last_name || !email || !phone) {
            return res.json({ success: false, message: "Missing details" })
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Enter a valid email" })
        }

        if (phone.length !== 10) {
            return res.json({ success: false, message: "Phone number should be 10 characters" })
        }

        const userDB = await pool.query("UPDATE users SET first_name = $1, last_name= $2, email= $3 , phone = $4 WHERE id=$5", [first_name, last_name, email, phone, userId]);

        const { rows } = await pool.query("SELECT * FROM patients WHERE user_id = $1", [userId]);

        if (rows.length === 0) {
            const insertPatientDB = await pool.query("INSERT INTO patients (user_id, dob, gender, address) VALUES ($1,$2,$3,$4)", [userId, dob, gender, address])
            res.json({ success: true, message: "Details updated" });
        } else {
            const updatePatientDB = await pool.query("UPDATE patients SET dob = $1, gender= $2, address= $3 WHERE user_id=$4", [dob, gender, address, userId]);
            res.json({ success: true, message: "Details updated" });
        }

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message })
    }
}

const updatePassword = async (req, res) => {
    try {
        const userId = req.user.id
        const { password } = req.body;

        //hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const updatePwd = await pool.query("UPDATE users SET password_hash = $1 WHERE id=$2", [hashedPassword, userId])

        res.json({ success: true, message: `Password updated` });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Could not update password!Try again" })
    }
}

const deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id
        const userDB = await pool.query("DELETE FROM users WHERE id=$1", [userId])

        res.json("Account deleted succesfully!")

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Could not delete account!Try again" })

    }
}

async function updateProfilePicture(req, res) {
    try {
        const userId = req.user?.id || req.doctor?.id;
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No image file provided" });
        }

        if (!req.file.mimetype.startsWith("image/")) {
            return res.json({
                success: false,
                message: "Only images allowed"
            });
        }

        const uploadFromBuffer = () => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "clinicbook_profiles",
                        public_id: `user_${userId}`,
                        overwrite: true,
                        resource_type: "image",
                        allowed_formats: ["jpg", "jpeg", "png", "webp"],
                        transformation: [
                            { width: 400, height: 400, crop: "fill", gravity: "face" },
                            { quality: "auto", fetch_format: "auto" }
                        ],
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                streamifier
                    .createReadStream(req.file.buffer)
                    .pipe(stream);
            });
        };

        const result = await uploadFromBuffer();
        await pool.query("UPDATE users SET image = $1 WHERE id = $2", [result.secure_url, userId]);

        res.json({ success: true, message: "Profile image updated", imageUrl: result.secure_url });
    } catch (err) {
        console.error("Avatar upload error:", err);
        if (req.file?.filename) {
            await cloudinary.uploader.destroy(req.file.filename).catch(() => { });
        }
        res.status(500).json({ success: false, message: "Failed to update profile picture" });
    }
}

async function removeProfilePicture(req, res) {
    try {
        const userId = req.user?.id || req.doctor?.id;
        const publicId = `user_${userId}`
        console.log(publicId);

        await cloudinary.uploader.destroy(`clinicbook_profiles/user_${userId}`);
        const userDB = await pool.query("UPDATE users SET image = 'default-avatar.png' WHERE id = $1", [userId]);
        res.json({ success: true, message: "Photo image deleted" });
    } catch (err) {
        console.error("Avatar remove error:", err);
        res.status(500).json({ error: "Failed to remove profile picture" });
    }
}

//book appointment
const bookAppointment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { docId, slotDate, slotBooked, reason } = req.body;
        console.log(userId, docId, slotDate, slotBooked);

        // Validate input
        if (!userId || !docId || !slotDate || !slotBooked) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const today = new Date().toISOString().split("T")[0];

        if (slotDate < today) {
            return res.json({
                success: false,
                message: "Cannot book past dates"
            });
        }

        // Check if slot is already booked
        const existing = await pool.query("SELECT * FROM appointment WHERE doctor_id = $1 AND appointment_date = $2 AND slot_time = $3 AND status NOT IN ('cancelled', 'no-show')", [docId, slotDate, slotBooked]);

        if (existing.rows.length > 0) {
            return res.json({ success: false, message: "Slot already booked" });
        }

        // Insert new appointment
        const newAppointment = await pool.query("INSERT INTO appointment (patient_id, doctor_id, appointment_date, slot_time, status, reason) VALUES ($1, $2, $3, $4, 'scheduled', $5) RETURNING *", [userId, docId, slotDate, slotBooked, reason || null]);

        res.json({ success: true, message: "Appointment booked successfully", appointment: newAppointment.rows[0] });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

//api to get user appointment for frontend
const listAppointment = async (req, res) => {
    try {
        const userId = req.user.id;
        // const appointments = await pool.query("SELECT * FROM appointment WHERE patient_id = $1", [userId]);
        const appointments = await pool.query(`
            SELECT 
                a.*,
                u.first_name || ' ' || u.last_name AS doctor_name
            FROM appointment a
            JOIN doctors d ON a.doctor_id = d.user_id
            JOIN users u ON d.user_id = u.id
            WHERE a.patient_id = $1
            ORDER BY a.appointment_date DESC
        `, [userId]);

        const appointmentData = appointments.rows; // return all appointments booked by patient

        res.json({ success: true, appointmentData })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

//api to get doctors
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

//api for cancelling appointmet
const cancelAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const userId = req.user.id
        const appointment = await pool.query(
            `SELECT * FROM appointment 
            WHERE id = $1 AND patient_id = $2`,
            [appointmentId, userId]
        );

        //VERIFY appointment USER
        if (appointment.rows[0].id !== appointmentId) {
            return res.json({ success: false, message: "Unauthorized action" })
        }

        const updateAppointment = await pool.query(
            `UPDATE appointment 
            SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
            WHERE id = $1`,
            [appointmentId]
        );
        res.json({ success: true, message: "Appointment cancelled" })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

//api for doctor profile to book appointment
const doctorProfile = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id);

        const doctorDB = await pool.query(`
            SELECT 
                u.first_name,
                u.last_name,
                u.image,
                u.email,
                d.bio,
                d.specialization,
                d.start_time,
                d.end_time
            FROM users u
            JOIN doctors d ON u.id = d.user_id
            WHERE d.user_id = $1
        `, [id]);

        if (doctorDB.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }

        res.json({
            success: true,
            doctor: doctorDB.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });

    }

}

const getBookedSlots = async (req, res) => {
    const { doctorId, date } = req.params;
    console.log(doctorId, date);

    try {
        const result = await pool.query(
            `SELECT TO_CHAR(slot_time, 'HH24:MI') AS slot_time 
                FROM appointment 
                WHERE doctor_id = $1 
                AND appointment_date = $2::date 
                AND status NOT IN ('cancelled', 'no-show')`,
            [doctorId, date]
        );

        const bookedSlots = result.rows.map(r => r.slot_time);
        res.json({ success: true, bookedSlots });

    } catch (error) {
        console.error(error);
        res.json({
            success: false,
            message: error.message
        });
    }
}

const appointmentDetails = async (req, res) => {
    try {
        const { apptid, role } = req.params;

        const userId = req.user.id
        const notAppt = await pool.query("SELECT * FROM appointment WHERE id=$1 AND patient_id=$2", [apptid, userId])

        if (notAppt.rows.length === 0) {
            res.json({ success: false, message: 'Appointment not found' });
        }

        const appointmentDB = await pool.query(`
            SELECT 
                a.*,
                d_u.first_name || ' ' || d_u.last_name AS doctor_name,
                d_u.image AS doctor_image,  -- Added doctor's image
                d.specialization,
                p.first_name || ' ' || p.last_name AS patient_name,
                p.image AS patient_image,   -- Optional: also get patient's image
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
                d_u.image,  -- Added to GROUP BY
                d.specialization,
                p.first_name, p.last_name,
                p.image     -- Added to GROUP BY if including patient image
            `, [apptid]);

        const appointmentData = appointmentDB.rows[0];
        if (appointmentDB.rows[0].patient_id !== userId) {
            res.json({ success: false, message: 'Access denied' })
        }
        console.log(appointmentData);


        res.json({ "success": true, appointmentData })
    } catch (error) {
        console.error(error);
        res.json({
            success: false,
            message: error.message
        });
    }
}

const nextAppointment = async (req, res) => {
    try {
        const userId = req.user.id

        const appointmentDB = await pool.query(`
            SELECT 
                a.appointment_date, a.slot_time, a.status,
                u.first_name || ' ' || u.last_name AS doctor_name,
                d.specialization
            FROM appointment a
            JOIN doctors d ON a.doctor_id = d.user_id
            JOIN users u ON d.user_id = u.id
            WHERE a.patient_id = $1 AND a.status ='scheduled'
            ORDER BY a.appointment_date DESC
        `, [userId]);

        const appointmentData = appointmentDB.rows[0] || "None"
        res.json({ success: true, appointmentData })

    } catch (error) {
        console.error(error);
        res.json({
            success: false,
            message: error.message
        });
    }
}

export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, doctorList, doctorProfile, getBookedSlots, appointmentDetails, nextAppointment, updatePassword, deleteAccount, updateProfilePicture, removeProfilePicture }