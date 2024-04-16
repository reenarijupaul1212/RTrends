const path = require('path')
const multer = require('multer')


// Multer configuration for handling single and multiple file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/upload/products'); // Set the destination folder for storing uploaded images
  },
  filename: (req, file, cb) => {
    // Generate a unique filename for the uploaded file
    console.log(Date.now());
    console.log(path.extname(file.originalname));
    cb(null,file.originalname +'.webp');
  },
});

const uploads = multer({ storage: storage });


module.exports = uploads