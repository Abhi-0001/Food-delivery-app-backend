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
import { OfferInput } from "../dto";
import { Offer } from "../models/offer.model";
import { Order } from "../models";

// Vandor doc with id from Vandor model
interface VandorDocWithId extends VandorDoc {
  _id: string;
}

export async function loginVandor(
  req: Request,
  res: Response,
  next: NextFunction
) {
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

export async function getVandorProfile(
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
export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction
) {
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
export async function updateService(
  req: Request,
  res: Response,
  next: NextFunction
) {
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
export async function addFood(req: Request, res: Response, next: NextFunction) {
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
export async function getFoods(
  req: Request,
  res: Response,
  next: NextFunction
) {
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
export async function updateCoverImage(
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

// ************ OFFERS ************
export async function addOffer(req: Request, res: Response) {
  const user = req.user;

  try {
    const {
      offerType,
      title,
      description,
      minValue,
      offerAmount,
      startValidity,
      endValidity,
      promocode,
      promoType,
      bank,
      bins,
      pincode,
      isActive,
    } = <OfferInput>req.body;

    const existingVandor = await findVandor(user.id);
    const offer = await Offer.create({
      offerType,
      title,
      description,
      minValue,
      offerAmount,
      startValidity,
      endValidity,
      promocode,
      promoType,
      bank,
      bins,
      pincode,
      isActive,
      vandors: [existingVandor],
    });

    return res
      .status(200)
      .json({ message: "offer created succesfully", offer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err });
  }
}

export async function getOffers(req: Request, res: Response) {
  try {
    const user = req.user;
    const vandor = await findVandor(user.id);

    const allOffers = await Offer.find().populate("vandors");

    let currentOffers = [];
    allOffers.forEach((offer) => {
      const offerVandors = offer.vandors;
      offerVandors.forEach((offerVandor) => {
        if (offerVandor._id.toString() === user.id) {
          currentOffers.push(offer);
        }
      });
    });

    return res.status(200).json({ currentOffers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err });
  }
}
export async function editOffer(req: Request, res: Response) {
  try {
    const user = req.user;
    const offerId = req.params.id;

    const existingOffer = await Offer.findById(offerId);
    if (!existingOffer) throw new Error("NO offer exist with this id");

    const vandor = await findVandor(user.id);
    if (!vandor) throw new Error("NO Vandor exist with this offer");
    const {
      offerType,
      title,
      description,
      minValue,
      offerAmount,
      startValidity,
      endValidity,
      promocode,
      promoType,
      bank,
      bins,
      pincode,
      isActive,
    } = <OfferInput>req.body;

    existingOffer.offerType = offerType;
    existingOffer.title = title;
    existingOffer.description = description;
    existingOffer.minValue = minValue;
    existingOffer.offerAmount = offerAmount;
    existingOffer.startValidity = startValidity;
    existingOffer.endValidity = endValidity;
    existingOffer.promocode = promocode;
    existingOffer.promoType = promoType;
    existingOffer.bank = bank;
    existingOffer.bins = bins;
    existingOffer.pincode = pincode;
    existingOffer.isActive = isActive;

    const result = await existingOffer.save();

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err });
  }
}

// *********** HANDLING ORDERS ********

export async function getCurrentOrders(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const loggedInVandor = req.user;

  if (loggedInVandor) {
    const orders = await Order.find({ vandorId: loggedInVandor.id }).populate(
      "items.food"
    );

    if (orders) return res.status(200).json({ message: "succes", orders });

    return res.status(200).json({ message: "no orders yet" });
  }
  return res.status(400).json({ message: "Can't access orders" });
}

export async function getOrderDetails(req: Request, res: Response) {
  const loggedInVandor = req.user;
  if (loggedInVandor) {
    const orderId = req.params.id;
    const order = await Order.findById(orderId).populate("items.food");

    if (order) return res.status(200).json(order);
  }
  return res.status(400).json({ message: "Can't access orders" });
}

export async function processOrder(req: Request, res: Response) {
  const loggedInVandor = req.user;

  console.log(loggedInVandor);

  if (loggedInVandor) {
    const orderId = req.params.id;
    const { remarks, orderStatus, readyTime } = req.body;

    const order = await Order.findById(orderId).populate("items.food");

    if (remarks) order.remarks = remarks;
    if (orderStatus) order.orderStatus = orderStatus;
    if (readyTime) order.readyTime = readyTime;
    const orderResult = await order.save();

    if (orderResult) return res.status(200).json(orderResult);
  }
  return res.status(400).json({ message: "Can't access orders" });
}
