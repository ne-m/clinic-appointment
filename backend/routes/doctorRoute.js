import express from "express";
import { appointmentsDoctor, doctorDashboard, doctorList, doctorProfile, loginDoctor, updateDoctorProfile, changeAvailability, appointmentStatus, appointmentDetails, addAppointmentNote, followUpAppointment, updatePassword } from "../controllers/doctorController.js";
import authDoctor from "../middleware/authDoctor.js";
import { removeProfilePicture, updateProfilePicture } from "../controllers/userController.js";
import upload from "../middleware/multer.js";
// import { updatePassword } from "../controllers/userController.js";

const doctorRouter = express.Router();

doctorRouter.get('/list', doctorList);
doctorRouter.post('/login', loginDoctor)
doctorRouter.get('/appointments', authDoctor, appointmentsDoctor)
doctorRouter.put('/appointment-status', authDoctor, appointmentStatus)
doctorRouter.get('/dashboard', authDoctor, doctorDashboard)
doctorRouter.get('/profile', authDoctor, doctorProfile);
doctorRouter.put('/update-profile', authDoctor, updateDoctorProfile)
doctorRouter.put('/change-availability', changeAvailability)
doctorRouter.get("/appointment/:apptid/:role", authDoctor, appointmentDetails)
doctorRouter.post("/appointment-note/:apptid", authDoctor, addAppointmentNote)
doctorRouter.post("/follow-up", authDoctor, followUpAppointment)
doctorRouter.put("/update-password", authDoctor, updatePassword)

doctorRouter.put("/update-profile-picture", authDoctor, upload.single("image"), updateProfilePicture);
doctorRouter.delete("/remove-profile-picture", authDoctor, removeProfilePicture);


export default doctorRouter;