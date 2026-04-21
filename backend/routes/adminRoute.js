import express from "express"
import { addDoctor, adminDashboard, allDoctors, appointmentsAdmin, loginAdmin } from "../controllers/adminController.js"
import upload from "../middleware/multer.js"
import authAdmin from "../middleware/authAdmin.js";
import { changeAvailability } from "../controllers/doctorController.js";

const adminRouter = express.Router()

// adminRouter.post('/add-doctor', authAdmin, upload.single('image'), addDoctor);
adminRouter.post('/add-doctor', upload.single('image'), addDoctor);
adminRouter.post('/login', loginAdmin);  
adminRouter.get('/all-doctors', allDoctors);   //*use post
adminRouter.put('/change-availability',  changeAvailability)
adminRouter.get('/appointments', appointmentsAdmin)
adminRouter.get('/dashboard',  adminDashboard)

export default adminRouter;