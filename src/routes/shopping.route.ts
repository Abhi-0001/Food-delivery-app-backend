import { Router } from "express";
import {
  getFoodAvailability,
  getFoodIn30Min,
  getRestaurantById,
  getTopRestaurants,
  searchFood,
} from "../controllers";

const router = Router();

/********* FOOD AVAILABILITY WITH PINCODE ********** */
router.get("/:pincode", getFoodAvailability);

/********* FOOD IN 30 MIN WITH PINCODE ********** */
router.get("/food-in-30-min/:pincode", getFoodIn30Min);

/********* SEARCH FOOD WITH PINCODE ********** */
router.get("/search/:pincode", searchFood);

/********* TOP RESTAURANTS WITH PINCODE ********** */
router.get("/top-restaurant/:pincode", getTopRestaurants);

/********* RESTAURANT WITH ID ********** */
router.get("/restaurant/:id", getRestaurantById);

export { router as shoppingRouter };
