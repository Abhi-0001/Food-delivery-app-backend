import { Router } from "express";
import {
  addToCart,
  createOrder,
  createPayment,
  customerLogin,
  customerProfile,
  customerSignUp,
  customerUpdateProfile,
  customerVerify,
  deleteAllCartItems,
  getCart,
  requestOTP,
  verifyOffer,
} from "../controllers";
import { authenticate } from "../middlewares";
import { getOrderById, getOrders } from "../controllers";

const router = Router();

router.post("/signup", customerSignUp);
router.post("/login", customerLogin);

// authenticated routes of user/customer
router.use(authenticate);
router.post("/otp", requestOTP);
router.post("/verify", customerVerify);
router.get("/profile", customerProfile);
router.post("/update-profile", customerUpdateProfile);

// * Cart routes
router.post("/cart", addToCart);
router.get("/cart", getCart);
router.delete("/cart", deleteAllCartItems);

// * order routes
router.post("/order", createOrder);
router.get("/order", getOrders);
router.get("/order/:id", getOrderById);

// ********** APPLY OFFER ******
router.post("/offer/verify/:id", verifyOffer);

// ********** PAYMENT ******
router.post("/create-payment", createPayment);

export { router as customerRouter };
