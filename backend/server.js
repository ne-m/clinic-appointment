import express from "express";
import cors from "cors";
import "dotenv/config";
import pool from "./config/db.js"
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import dns from "dns";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoute.js";
// import dns from "dns";

// dns.setServers(["8.8.8.8", "8.8.4.4"]);

//app config
const app = express();
const port = process.env.PORT || 4000;
// dns.setServers(["8.8.8.8", "8.8.4.4"]);
connectCloudinary()

//middlewares
app.use(express.json());
app.use(cors( {origin: ["https://frontend-o0vy.onrender.com","https://admin-frontend-1vsr.onrender.com","https://doctor-frontend-rhe7.onrender.com","http://127.0.0.1:5501"]}));

//api endpoints
app.use('/api/admin', adminRouter); //localhost:4000/api/admin/add-doctor
app.use('/api/doctor', doctorRouter);
app.use('/api/user', userRouter);

app.get('/', (req,res)=>{
    res.send("API working")
})

app.listen(port, ()=>{
    console.log("Server started: ", port);
    
})