import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import {
  CreateDeliveryUserInputs,
  CustomerLoginInput,
  CustomerUpdateInput,
} from "../dto";
import { validate } from "class-validator";

import {
  generateHshPassword,
  generateLoginToken,
  generateOTP,
  generateSalt,
  validatePassword,
} from "../utils";
import { DeliveryUser, DeliveryUserDoc } from "../models";

// ****************SIGNUP************
export async function deliveryUserSignup(req: Request, res: Response) {
  const deliveryUserInput = plainToInstance(CreateDeliveryUserInputs, req.body);
  const deliveryUserErr = await validate(deliveryUserInput, {
    validationError: { target: true },
  });
  if (deliveryUserErr.length) {
    return res.status(400).json({ message: deliveryUserErr });
  }
  const { email, password, phone, firstName, lastName, address, pincode } =
    deliveryUserInput;

  const emailAlreadyExist = await DeliveryUser.findOne({ email });
  if (emailAlreadyExist)
    return res
      .status(403)
      .json({ message: "Delivery User already exist with this email" });
  const phoneAlreadyExist = await DeliveryUser.findOne({ phone });
  if (phoneAlreadyExist)
    return res
      .status(403)
      .json({ message: "Delivery User already exist with this phone number" });

  const salt = await generateSalt();
  const hshPassword = await generateHshPassword(password, salt);

  const createdCustomer = (await DeliveryUser.create({
    email,
    phone,
    password: hshPassword,
    firstName,
    lastName,
    address,
    pincode,
    salt,
    isVerified: false,
    isAvailable: false,
  })) as DeliveryUserDoc;

  if (createdCustomer) {
    // generate signature/Token
    const token = await generateLoginToken({
      id: String(createdCustomer._id),
      isVerified: createdCustomer.isVerified,
      email,
    });
    // send response
    return res.status(200).json({ token });
  }
  return res.status(500).json({
    message:
      "Internal server error, Account couldn't created.\n Please try again",
  });
}

// **********LOGIN******************

export async function deliveryUserLogin(req: Request, res: Response) {
  const loginCredentials = plainToInstance(CustomerLoginInput, req.body);

  const loginError = await validate(loginCredentials, {
    validationError: { target: true },
  });

  if (loginError.length) {
    return res.status(400).json({ message: loginError });
  }
  const { email, password } = loginCredentials;

  const existingDeliveryUser = (await DeliveryUser.findOne({
    email,
  })) as DeliveryUserDoc;

  if (existingDeliveryUser) {
    const isValid = await validatePassword(
      password,
      existingDeliveryUser.password
    );
    // password check
    if (isValid) {
      const token = await generateLoginToken({
        id: String(existingDeliveryUser._id),
        email: existingDeliveryUser.email,
        isVerified: existingDeliveryUser.isVerified,
      });

      return res.status(200).json({ token, message: "logged in succesfully" });
    }

    return res.status(404).json({ message: "password is not correct" });
  }
  return res.status(404).json({ message: "email is not correct" });
}

// ********** GET DELIVERY USER PROFILE ******************
export async function deliveryUserProfile(req: Request, res: Response) {
  const deliveryUser = req.user;
  const existingDeliveryUser = await DeliveryUser.findById(deliveryUser?.id);
  if (existingDeliveryUser) {
    return res.status(200).json(existingDeliveryUser);
  }
  return res
    .status(500)
    .json({ message: "Error in fetching customer details right now" });
}

// ********** UPDATE DELIVERY USER PROFILE ******************
export async function updateDeliveryUserProfile(req: Request, res: Response) {
  const deliveryUser = req.user;
  const { firstName, lastName, address, pincode } = <CustomerUpdateInput>(
    req.body
  );
  const existingDeliveryUser = await DeliveryUser.findById(deliveryUser?.id);
  if (existingDeliveryUser) {
    if (firstName) existingDeliveryUser.firstName = firstName;
    if (lastName) existingDeliveryUser.lastName = lastName;
    if (address) existingDeliveryUser.address = address;
    if (pincode) existingDeliveryUser.pincode = pincode;

    const updatedDeliveryUser = await existingDeliveryUser.save();
    return res.status(200).json(updatedDeliveryUser);
  }
  return res
    .status(500)
    .json({ message: "Couldn't updating customer details right now" });
}

export async function updateDeliveryUserStatus(req: Request, res: Response) {
  const deliveryUser = req.user;
  const { lat, lng } = req.body;

  const deliveryUserProfile = await DeliveryUser.findById(deliveryUser.id);
  if (lat && lng) {
    deliveryUserProfile.lat = lat;
    deliveryUserProfile.lng = lng;

    deliveryUserProfile.isAvailable = !deliveryUserProfile.isAvailable;
    const result = await deliveryUserProfile.save();

    if (result.isAvailable)
      return res.status(200).json({ message: "you are online now" });
    else return res.status(200).json({ message: "you are offline now" });
  } else return res.status(304).json({ message: "invalid position" });

  return res.status(500).json("Internal server error.");
}
