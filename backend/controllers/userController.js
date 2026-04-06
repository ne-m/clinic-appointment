import pool from "../config/db.js";
import validator from "validator";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import 'dotenv/config';
import { v2 as cloudinary } from "cloudinary"

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
            return res.json({ success: false, message: "Enter a strong password" })
        }

        //hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = await pool.query("INSERT INTO users (first_name, last_name, email,phone, password_hash, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id", [first_name, last_name, email, phone, hashedPassword, role]);
        // res.json(newUser.rows[0]);
        // const newUserAdditionalInfo = await pool.query("INSERT INTO patients (user_id, dob, gender) VALUES ($1, $2, $3)", [newUser.rows[0], dob, gender])
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

        const user = await pool.query("SELECT * FROM users WHERE email = $1 where role = 'patient'", [email]);
        const userDetails = user.rows[0];
        // console.log(userDetails);

        if (userDetails.email !== email) {
            res.json({ success: false, message: "User does not exist" })
        }

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
        
        const data = await pool.query("SELECT * FROM users WHERE id = $1 ", [userId]);
        const userData = data.rows[0]
        // console.log(userData);

        res.json({ success: true, userData });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message })
    }
}

//update user profile *** 9.37.00***
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log(userId);
        
        const data = await pool.query("SELECT * FROM users INNER JOIN  WHERE id = $1 ", [userId]);
        const userData = data.rows[0];

        const imageFile = req.imageFile

        if (condition) {

        }

        res.json({ success: true, userData });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message })
    }
}

//book appointment
const bookAppointment = async (req, res) => {
    try {
        const userId = req.user.id;
        const {docId, slotDate, slotBooked, reason } = req.body;
        console.log(userId, docId, slotDate, slotBooked);
        
        // Validate input
        if (!userId || !docId || !slotDate || !slotBooked) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
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
        console.log(userId);

        const appointments = await pool.query("SELECT * FROM appointment WHERE patient_id = $1", [userId]);
        const appointmentData = appointments.rows[0];

        res.json({ success: true, appointmentData })


    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
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
        res.json({success:true, message:"Appointment cancelled"})

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });

    }
}
export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment }