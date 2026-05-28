// import multer from "multer";

// const storage = multer.diskStorage({
//     filename: function(req, file, callback){
//         callback(null, file.originalname)
//     }
// });  //config for disk storage

// //instance using disk storage
// const upload = multer({
//     storage,
//     limits: {
//         fileSize: 5 * 1024 * 1024 // 5MB
//     }
// })

// export default upload;

// middleware/multer.js

import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

export default upload;