import { NextFunction, Request, Response } from "express";
import { Vandor } from "../models/vandor.model";
import { FoodDoc } from "../models/food.model";

/**********  SEARCH FOOD    ************ */
async function searchFood(req: Request, res: Response, next: NextFunction) {
  const pincode = req.params.pincode;

  const vandors = await Vandor.find({
    pincode,
    serviceAvailable: true,
  }).populate(["foods"]);

  if (vandors.length) {
    const foods = vandors.map((vandor) => vandor.foods).flat();
    if (foods.length) {
      return res.status(200).json(foods);
    }
    return res
      .status(400)
      .json({ message: "restaurants have no food right now" });
  }
  return res
    .status(400)
    .json({ message: "No restaurant in this pincode zone." });
}

/********* FOOD AVAILABILITY WITH PINCODE ********** */
async function getFoodAvailability(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const pincode = req.params.pincode;

  const vandors = await Vandor.find({
    pincode,
    serviceAvailable: true,
  })
    .sort([["rating", "descending"]])
    .populate(["foods"]);

  if (vandors.length) {
    const foods = vandors.map((vandor) => vandor.foods).flat();
    if (foods.length) {
      return res.status(200).json(foods);
    }
    return res
      .status(400)
      .json({ message: "restaurants have no food right now" });
  }
  return res
    .status(400)
    .json({ message: "No restaurant in this pincode zone." });
}
/********* FOOD IN 30 MIN WITH PINCODE ********** */
async function getFoodIn30Min(req: Request, res: Response, next: NextFunction) {
  const pincode = req.params.pincode;

  const vandors = await Vandor.find({
    pincode,
    serviceAvailable: true,
  }).populate(["foods"]);

  if (vandors.length) {
    const foods = vandors.map((vandor) => vandor.foods).flat() as [FoodDoc];
    if (foods.length) {
      const foodsIn30Min = foods.filter((food) => food?.readyTime < 30);
      if (foodsIn30Min.length) {
        return res.status(200).json(foodsIn30Min);
      }
      return res.status(400).json({
        message: "Food under 30 min are not available right now in this zone",
      });
    }
    return res
      .status(400)
      .json({ message: "restaurants have no food right now" });
  }
  return res
    .status(400)
    .json({ message: "No restaurant in this pincode zone." });
}

/********* TOP RESTAURANTS WITH PINCODE ********** */
async function getTopRestaurants(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const pincode = req.params.pincode;

  const vandors = await Vandor.find({
    pincode,
    serviceAvailable: true,
  })
    .sort([["rating", "descending"]])
    .limit(3);

  if (vandors.length) {
    return res.status(200).json(vandors);
  }
  return res
    .status(400)
    .json({ message: "No restaurant in this pincode zone." });
}

/********* RESTAURANT WITH ID ********** */
async function getRestaurantById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const id = req.params.id;

  const vandor = await Vandor.find({
    _id: id,
  }).populate(["foods"]);

  if (vandor.length) {
    return res.status(200).json(vandor);
  }
  return res.status(400).json({ message: "No restaurant exist with this id" });
}

export {
  searchFood,
  getFoodAvailability,
  getFoodIn30Min,
  getTopRestaurants,
  getRestaurantById,
};
