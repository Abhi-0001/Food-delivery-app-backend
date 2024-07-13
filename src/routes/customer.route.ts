import { Router } from "express";
import {
  customerLogin,
  customerProfile,
  customerSignUp,
  customerUpdateProfile,
  customerVerify,
  requestOTP,
} from "../controllers";
import { authenticate } from "../middlewares";

const router = Router();

router.post("/signup", customerSignUp);
router.post("/login", customerLogin);

// authenticated routes of user/customer
router.use(authenticate);
router.post("/otp", requestOTP);
router.post("/verify", customerVerify);
router.get("/profile", customerProfile);
router.post("/update-profile", customerUpdateProfile);

export { router as customerRouter };
