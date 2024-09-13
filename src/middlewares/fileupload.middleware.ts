import multer from "multer";

// file upload middleware with multer
// *************************
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/assets/images");
  },
  filename: function (req, file, cb) {
    const fileName = Date.now().toString() + "_" + file.originalname;
    cb(null, fileName);
  },
});
export const uploadImages = multer({ storage: imageStorage }).array(
  "images",
  10
);
// *************************
