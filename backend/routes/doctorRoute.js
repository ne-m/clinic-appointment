import express from "express";
import { appointmentsDoctor, doctorDashboard, doctorList, doctorProfile, loginDoctor, updateDoctorProfile, changeAvailability, appointmentStatus } from "../controllers/doctorController.js";
import authDoctor from "../middleware/authDoctor.js";

const doctorRouter = express.Router();

doctorRouter.get('/list', doctorList);
doctorRouter.post('/login', loginDoctor)
doctorRouter.get('/appointments', authDoctor,appointmentsDoctor)
doctorRouter.put('/appointment-status', authDoctor, appointmentStatus)
doctorRouter.get('/dashboard', authDoctor,doctorDashboard)
doctorRouter.get('/profile', authDoctor, doctorProfile);
doctorRouter.put('/update-profile', authDoctor, updateDoctorProfile)
doctorRouter.put('/change-availability',  changeAvailability)

export default doctorRouter;