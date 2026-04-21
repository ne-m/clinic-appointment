import express from "express"
import { bookAppointment, cancelAppointment, doctorList, getProfile, listAppointment, loginUser, registerUser, updateProfile,doctorProfile } from "../controllers/userController.js"
import authUser from "../middleware/authUser.js";
// import {bookAppointmentTwo} from "../controllers/book.js";

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);

userRouter.get('/profile', authUser, getProfile);
userRouter.put('/update/profile', authUser, updateProfile);
userRouter.post('/book-appointment', authUser, bookAppointment)
userRouter.get("/appointments", authUser, listAppointment)
userRouter.put("/cancel-appointment", authUser, cancelAppointment)

userRouter.get('/list-doctors', authUser,doctorList);
userRouter.get('/doctor/:id', authUser,doctorProfile);


export default userRouter;