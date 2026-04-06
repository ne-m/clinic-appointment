import jwt from "jsonwebtoken"
import "dotenv/config"

//doctor auth middleware
const authDoctor = async (req,res,next)=>{
    try {
        const {dtoken} = req.headers;
        if (!dtoken) {
            return res.json({success:false, message:'Not authorized. Login again.'})
        }
        const tokenDecode = jwt.verify(dtoken, process.env.JWT_SECRET);
        req.doctor = {id: tokenDecode.id};
        next();
    } catch (error) {
        console.error(error);
        res.json({success: false, message:error.message})
    }
}

export default authDoctor;