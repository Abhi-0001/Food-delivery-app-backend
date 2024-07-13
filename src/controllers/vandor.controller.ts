import { NextFunction, Request, Response } from "express";

import {
  LoginVandorInput,
  VandorPayload,
  VandorProfileUpdate,
} from "../dto/vandor.dto";
import { findVandor } from ".";
import { generateLoginToken, validatePassword } from "../utils/password.utils";
import { VandorDoc } from "../models/vandor.model";
import { CreateFoodInput } from "../dto/food.dto";
import { Food, FoodDoc } from "../models/food.model";

// Vandor doc with id from Vandor model
interface VandorDocWithId extends VandorDoc {
  _id: string;
}

async function loginVandor(req: Request, res: Response, next: NextFunction) {
  const { email, password } = <LoginVandorInput>req.body;
  const existingVandor = (await findVandor("", email)) as VandorDocWithId;

  try {
    if (existingVandor) {
      const validatePass = await validatePassword(
        password,
        existingVandor.password
      );

      if (!validatePass)
        return res.status(401).json({ message: "password entered is invalid" });

      const token = await generateLoginToken({
        id: existingVandor._id,
        name: existingVandor.name,
        email: existingVandor.email,
        foodType: existingVandor.foodType,
      });

      return res.status(200).json({ token });
    } else
      return res
        .status(401)
        .json({ message: "vandor with this email does not exist" });
  } catch (err) {
    res.status(500).json({ message: "internal server error" });
  }
}

async function getVandorProfile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const payload = req.user;
  const existingUser = (await findVandor(payload?.id)) as VandorDocWithId;

  if (existingUser) return res.status(200).json(existingUser);
  return res.status(401).json({ message: "user not found" });
}

// vandor profile update controller
async function updateProfile(req: Request, res: Response, next: NextFunction) {
  const { name, foodType, phone, address, pincode } = <VandorProfileUpdate>(
    req.body
  );
  const payload = req.user;
  const existingUser = (await findVandor(payload?.id)) as VandorDocWithId;

  if (existingUser) {
    if (name) existingUser.name = name;
    if (foodType) existingUser.foodType = foodType;
    if (phone) existingUser.phone = phone;
    if (address) existingUser.address = address;
    if (pincode) existingUser.pincode = pincode;
    const updatedUser = await existingUser.save();
    return res.status(200).json(updatedUser);
  }
  return res.status(401).json({ message: "user not found" });
}

// vandor service update controller
async function updateService(req: Request, res: Response, next: NextFunction) {
  const payload = req.user;
  const existingVandor = (await findVandor(payload?.id)) as VandorDocWithId;

  if (existingVandor) {
    existingVandor.serviceAvailable = !existingVandor.serviceAvailable;
    const updatedUser = await existingVandor.save();
    return res.status(200).json(updatedUser);
  }
  return res.status(401).json({ message: "user not found" });
}

// add new food item
async function addFood(req: Request, res: Response, next: NextFunction) {
  const { name, description, price, foodType, readyTime, category, rating } = <
    CreateFoodInput
  >req.body;
  const payload = req.user;
  const existingVandor = (await findVandor(payload?.id)) as VandorDocWithId;

  if (existingVandor) {
    const imageFiles = req.files as [Express.Multer.File];

    const images = imageFiles.map((file) => file.filename);

    const createdFood = (await Food.create({
      vandorId: existingVandor._id,
      name,
      description,
      price,
      foodType,
      readyTime,
      category,
      rating,
      images,
    })) as FoodDoc;
    existingVandor.foods.push(createdFood);
    const updatedUser = await existingVandor.save();
    return res.status(200).json(updatedUser);
  }
  return res
    .status(401)
    .json({ message: "Something went wrong to add new food" });
}

// get all food items of authenticated/loggedIn vandor
async function getFoods(req: Request, res: Response, next: NextFunction) {
  const existingVandor = <VandorPayload>req.user;
  // here no need of finding vandor's full object as we can get id from authenticated vandorPayload
  // const existingVandor = (await findVandor(payload?.id)) as VandorDocWithId;

  const availableFoods = (await Food.find({ vandorId: existingVandor.id })) as [
    FoodDoc
  ];

  if (availableFoods) {
    return res.status(200).json(availableFoods);
  }
  return res
    .status(401)
    .json({ message: "Something went wrong during fetching food" });
}

// add Cover image
async function updateCoverImage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { name, description, price, foodType, readyTime, category, rating } = <
    CreateFoodInput
  >req.body;
  const payload = req.user;
  const existingVandor = (await findVandor(payload?.id)) as VandorDocWithId;

  if (existingVandor) {
    const imageFiles = req.files as [Express.Multer.File];

    const images = imageFiles.map((file) => file.filename);

    existingVandor.coverImages.push(...images);

    const updatedUser = await existingVandor.save();
    return res.status(200).json(updatedUser);
  }
  return res
    .status(401)
    .json({ message: "Something went wrong during updating cover image" });
}

// async function updateVandor(req: Request, res: Response, next: NextFunction) {}

export {
  loginVandor,
  getVandorProfile,
  updateProfile,
  updateService,
  getFoods,
  addFood,
  updateCoverImage,
};
