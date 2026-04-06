import jwt from "jsonwebtoken"

//user auth middleware
const authUser = async (req,res,next)=>{
    try {
        const {token} = req.headers;
        if (!token) {
            return res.json({success:false, message:'Not authorized. Login again 1'})
        }
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

        // req.body = tokenDecode.id;
        req.user = {id: tokenDecode.id};
        // console.log(req.body, tokenDecode.id);
        
        next();
    } catch (error) {
        console.error(error);
        res.json({success: false, message:error.message})
        
    }
}

export default authUser;