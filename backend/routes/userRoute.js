import express from "express"
import { bookAppointment, cancelAppointment, doctorList, getProfile, listAppointment, loginUser, registerUser, updateProfile,doctorProfile, getBookedSlots, appointmentDetails, nextAppointment, updatePassword, deleteAccount, updateProfilePicture, removeProfilePicture } from "../controllers/userController.js"
import authUser from "../middleware/authUser.js";
// import upload from "../middleware/upload.js";
import upload from "../middleware/multer.js";
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
userRouter.get("/booked-slots/:doctorId/:date", authUser, getBookedSlots)
userRouter.get("/appointment/:apptid/:role", authUser, appointmentDetails)
userRouter.get("/upcoming-appointment", authUser, nextAppointment)
userRouter.put("/update-password", authUser, updatePassword)
userRouter.delete("/delete", authUser, deleteAccount)

userRouter.put("/update-profile-picture", authUser, upload.single("image"), updateProfilePicture);
userRouter.delete("/remove-profile-picture", authUser, removeProfilePicture);
export default userRouter;