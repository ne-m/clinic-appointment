import multer from "multer";

const storage = multer.diskStorage({
    filename: function(req, file, callback){
        callback(null, file.originalname)
    }
});  //config for disk storage

//instance using disk storage
const upload = multer({
    storage
})

export default upload;
