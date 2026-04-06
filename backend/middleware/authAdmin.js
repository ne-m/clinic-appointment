import jwt from "jsonwebtoken"

//admin auth middleware
const authAdmin = async (req,res,next)=>{
    try {
        const {atoken} = req.headers;
        if (!atoken) {
            return res.json({success:false, message:'Not authorized. Login again 1'})
        }
        const tokenDecode = jwt.verify(atoken, process.env.JWT_SECRET);
        if (tokenDecode.email !== process.env.ADMIN_EMAIL ) {
            return res.json({success:false, message:'Not authorized. Login again 2'})
        }

        req.admin = tokenDecode;
        next();
    } catch (error) {
        console.error(error);
        res.json({success: false, message:error.message})
        
    }
}

export default authAdmin;