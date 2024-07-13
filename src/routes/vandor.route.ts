import { Router } from "express";
import {
  addFood,
  getFoods,
  getVandorProfile,
  loginVandor,
  updateCoverImage,
  updateProfile,
  updateService,
} from "../controllers";
import { authenticate } from "../middlewares";
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
const uploadImages = multer({ storage: imageStorage }).array("images", 10);
// *************************

const router = Router();

router.post("/login", loginVandor);

// authenticated routes after this
router.use(authenticate);

router.get("/profile", getVandorProfile);
router.patch("/profile", updateProfile);
router.patch("/service", updateService);

router.patch("/coverimage", uploadImages, updateCoverImage);
router.post("/food", uploadImages, addFood);
router.get("/foods", getFoods);

export { router as VandorRouter };
