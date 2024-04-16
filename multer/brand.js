const path = require('path')
const multer = require('multer')


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/upload/brand');
    },
    filename: (req, file, cb) => {
      console.log(Date.now());
      console.log(path.extname(file.originalname));
      cb(null,file.originalname +'.webp');
    },
});
const upload = multer({ storage: storage });

module.exports = upload
