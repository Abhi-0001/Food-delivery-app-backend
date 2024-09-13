import { Router } from "express";
import {
  addFood,
  addOffer,
  editOffer,
  getCurrentOrders,
  getFoods,
  getOffers,
  getOrderDetails,
  getVandorProfile,
  loginVandor,
  processOrder,
  updateCoverImage,
  updateProfile,
  updateService,
} from "../controllers";
import { authenticate } from "../middlewares";
import { uploadImages } from "../middlewares";

const router = Router();

router.post("/login", loginVandor);

router.use(authenticate);
//*** authenticated routes after this

// *** PROFILE
router.get("/profile", getVandorProfile);
router.patch("/profile", updateProfile);
router.patch("/service", updateService);
router.patch("/coverimage", uploadImages, updateCoverImage);

// *** FOODS
router.post("/food", uploadImages, addFood);
router.get("/foods", getFoods);

//****  OFFERS
router.post("/offer", addOffer);
router.get("/offers", getOffers);
router.put("/offer/:id", editOffer);

// ***  ORDERs

router.get("/order", getCurrentOrders);
router.get("/order/:id", getOrderDetails);
router.patch("/order/:id/process", processOrder);

export { router as VandorRouter };
