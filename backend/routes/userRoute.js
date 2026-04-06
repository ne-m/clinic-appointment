import express from "express"
import { bookAppointment, cancelAppointment, getProfile, listAppointment, loginUser, registerUser } from "../controllers/userController.js"
import authUser from "../middleware/authUser.js";
// import {bookAppointmentTwo} from "../controllers/book.js";

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);

userRouter.get('/profile', authUser, getProfile);
userRouter.post('/book-appointment', authUser, bookAppointment)
userRouter.get("/appointments", authUser, listAppointment)
userRouter.put("/cancel-appointment", authUser, cancelAppointment)

export default userRouter;