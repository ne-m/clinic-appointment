import validator from "validator"
import bcrypt from "bcrypt"
import { v2 as cloudinary } from "cloudinary"
import 'dotenv/config';
import jwt from "jsonwebtoken"
//api for adding doctor
import pool from "../config/db.js";


const addDoctor = async (req, res) => {
    try {
        const { first_name, last_name, email, phone, password, role } = req.body;
        const imageFile = req.file;

        console.log("1 ", imageFile);

        //check for all inputs
        if (!first_name || !last_name || !email || !phone || !password || !role) {
            console.log(first_name, last_name, email, phone, password, role);
            return res.json({ sucess: false, message: "Missing details" })
        }
        console.log("all inputs");

        //validating email format
        if (!validator.isEmail(email)) {
            return res.json({ sucess: false, message: "Please enter a valid email" })
        }
        console.log("email");


        //validate strong password
        if (password.length < 8) {
            return res.json({ sucess: false, message: "Please enter a strong password" })
        }

        console.log("pass");


        //encrypt password hashing doc pass
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        console.log("hashed");


        //upload img to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        const imageURL = imageUpload.secure_url;

        console.log(imageURL);


        const newUser = await pool.query(
            `INSERT INTO users (image, first_name, last_name, email, phone, password_hash, role)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [imageURL, first_name, last_name, email, phone, hashedPassword, role]
        );

        console.log('new user docotr');


        const doctor_id = newUser.rows[0].id;
        const { specialization, bio, start_time, end_time, day_of_week } = req.body;
        const newDoctor = await pool.query(
            `INSERT INTO doctors (user_id, specialization, bio, start_time, end_time, day_of_week)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [doctor_id, specialization, bio, start_time, end_time, day_of_week]
        );

        console.log("new doctor");

        // res.json(newDoctor.rows[0]);
        res.json({ sucess: true, doctor: newDoctor.rows[0] })
        // console.log(req.file);

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error in addDoctor" })
    }
};

//API FOR ADMIN LOGIN
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            // CORRECTED: Proper JWT sign syntax
            const token = jwt.sign(
                { email: email, password: password },  // Payload
                process.env.JWT_SECRET            // Secret //session to be added later
            );

            res.json({
                success: true, token, message: "Admin login successful"
            });
        } else {
            res.json({
                success: false, message: "Invalid credentials"
            });
        }
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "admin login" })
    }
}

// api to get all doc list for admin panel
const allDoctors = async (req, res) => {
    try {
        const doctors = await pool.query("SELECT u.id AS user_id, u.first_name, u.last_name, u.email, u.phone, u.image, u.created_at, d.user_id AS doctor_id, d.specialization, d.bio, d.start_time, d.end_time, d.day_of_week, d.is_working, d.created_at AS doctor_active FROM users u INNER JOIN doctors d ON u.id = d.user_id WHERE u.role = 'doctor';")
        res.json({ success: true, doctors })
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message })

    }
}

//api to get all appointments list
const appointmentsAdmin = async (req, res) => {
    try {
        const appointments = await pool.query("SELECT * FROM appointment;")
        res.json({ success: true, appointments })
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message })

    }
}

//api to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
    try {
        const doctors = await pool.query("SELECT * FROM doctors;");
        const users = await pool.query("SELECT * FROM users WHERE role = 'patient';");
        const appointments = await pool.query("SELECT * FROM appointment;");
        const latestAppointments = await pool.query(`SELECT * FROM appointment ORDER BY appointment_date DESC, slot_time DESC LIMIT 5;`);

        const dashData = {
            doctors: doctors.rows.length,
            appointments: appointments.rows.length,
            patients: users.rows.length,
            latestAppointments: latestAppointments.rows
        }

        res.json({success:true, dashData})

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message })

    }
}

export { addDoctor, loginAdmin, allDoctors, appointmentsAdmin, adminDashboard }

// const result = await pool.query(
//             `SELECT 
//                 a.id,
//                 a.appointment_date,
//                 a.slot_time,
//                 a.status,
//                 a.created_at,
//                 p.first_name AS patient_name,
//                 d.first_name AS doctor_name
//              FROM appointment a
//              JOIN users p ON a.patient_id = p.id
//              JOIN users d ON a.doctor_id = d.id
//              ORDER BY a.created_at DESC 
//              LIMIT 5`
//         );