import { Router } from "express";
import {} from "../controllers";
import { authenticate } from "../middlewares";
import {
  deliveryUserLogin,
  deliveryUserProfile,
  deliveryUserSignup,
  updateDeliveryUserProfile,
  updateDeliveryUserStatus,
} from "../controllers/delivery.controller";

const router = Router();

router.post("/signup", deliveryUserSignup);
router.post("/login", deliveryUserLogin);

// authenticated routes of user/customer
router.use(authenticate);

router.get("/profile", deliveryUserProfile);
router.post("/update-profile", updateDeliveryUserProfile);

router.put("/update-status", updateDeliveryUserStatus);

export { router as deliveryRouter };
