import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import {
  CreateCustomerInput,
  CustomerLoginInput,
  CustomerUpdateInput,
} from "../dto/index";
import { validate } from "class-validator";
import { Customer, CustomerDoc } from "../models";
import {
  generateHshPassword,
  generateLoginToken,
  generateOTP,
  generateSalt,
  validatePassword,
} from "../utils";
import { onRequestOTP } from "../services/sms.service";

// ****************SIGNUP************
async function customerSignUp(req: Request, res: Response) {
  const customerInput = plainToInstance(CreateCustomerInput, req.body);
  const customerErr = await validate(customerInput, {
    validationError: { target: true },
  });
  if (customerErr.length) {
    return res.status(400).json({ message: customerErr });
  }
  const { email, password, phone } = customerInput;

  const alreadyExist = await Customer.findOne({ email });
  if (alreadyExist)
    return res
      .status(403)
      .json({ message: "customer already exist with this email" });

  const salt = await generateSalt();
  const hshPassword = await generateHshPassword(password, salt);
  const { otp, otpExpiry } = generateOTP();
  const createdCustomer = (await Customer.create({
    email,
    phone,
    password: hshPassword,
    firstName: "User",
    salt,
    isVerified: false,
    otp,
    otpExpiry,
  })) as CustomerDoc;

  if (createdCustomer) {
    // send otp

    await onRequestOTP(otp, phone);

    // generate signature/Token
    const token = await generateLoginToken({
      id: String(createdCustomer._id),
      isVerified: createdCustomer.isVerified,
      email,
    });

    // send response
    return res
      .status(200)
      .json({ token, isVerified: createdCustomer.isVerified, email });
  }
  return res.status(500).json({
    message:
      "Internal server error, Account couldn't created.\n Please try again",
  });
}

// **********LOGIN******************

async function customerLogin(req: Request, res: Response) {
  const loginCredentials = plainToInstance(CustomerLoginInput, req.body);

  const loginError = await validate(loginCredentials, {
    validationError: { target: true },
  });

  if (loginError.length) {
    return res.status(400).json({ message: loginError });
  }
  const { email, password } = loginCredentials;

  const existingCustomer = (await Customer.findOne({ email })) as CustomerDoc;

  if (existingCustomer) {
    const isValid = await validatePassword(password, existingCustomer.password);
    // password check
    if (isValid) {
      const token = await generateLoginToken({
        id: String(existingCustomer._id),
        email: existingCustomer.email,
        isVerified: existingCustomer.isVerified,
      });

      return res.status(200).json({ token, message: "logged in succesfully" });
    }

    return res.status(404).json({ message: "password is not correct" });
  }
  return res.status(404).json({ message: "email is not correct" });
}

// Resend OTP
async function requestOTP(req: Request, res: Response) {
  // authenticated user
  const user = req.user;
  if (user) {
    const existingCustomer = (await Customer.findById(user.id)) as CustomerDoc;
    const { otp, otpExpiry } = generateOTP();
    existingCustomer.otp = otp;
    existingCustomer.otpExpiry = otpExpiry;
    await existingCustomer.save();
    onRequestOTP(otp, existingCustomer.phone);
    return res.status(201).json({ message: "OTP resent succesfully" });
  }
  return res
    .status(400)
    .json({ message: "Internal server error. please retry" });
}

// ********** VERIFTY CUSTOMER ******************
async function customerVerify(req: Request, res: Response) {
  const { otp: enteredOTP } = req.body;

  const userPayload = req.user;

  if (userPayload) {
    const existingCustomer = (await Customer.findById(
      userPayload.id
    )) as CustomerDoc;

    if (
      existingCustomer &&
      parseInt(enteredOTP) === existingCustomer.otp &&
      existingCustomer.otpExpiry >= new Date()
    ) {
      existingCustomer.isVerified = true;

      existingCustomer.save();
      const token = await generateLoginToken({
        id: String(existingCustomer._id),
        email: existingCustomer.email,
        isVerified: existingCustomer.isVerified,
      });
      return res.status(200).json({
        token,
        isVerified: existingCustomer.isVerified,
        email: existingCustomer.email,
      });
    }
    return res
      .status(404)
      .json({ message: "Otp is either wrong or time exceeded" });
  }
}

// ********** GET CUSTOMER PROFILE ******************
async function customerProfile(req: Request, res: Response) {
  const customer = req.user;
  const existingCustomer = await Customer.findById(customer?.id);
  if (existingCustomer) {
    return res.status(200).json(existingCustomer);
  }
  return res
    .status(500)
    .json({ message: "Error in fetching customer details right now" });
}

// ********** UPDATE CUSTOMER PROFILE ******************
async function customerUpdateProfile(req: Request, res: Response) {
  const customer = req.user;
  const { firstName, lastName, address, pincode } = <CustomerUpdateInput>(
    req.body
  );
  const existingCustomer = await Customer.findById(customer?.id);
  if (existingCustomer) {
    if (firstName) existingCustomer.firstName = firstName;
    if (lastName) existingCustomer.lastName = lastName;
    if (address) existingCustomer.address = address;
    if (pincode) existingCustomer.pincode = pincode;

    const updatedCustomer = await existingCustomer.save();
    return res.status(200).json(updatedCustomer);
  }
  return res
    .status(500)
    .json({ message: "Couldn't updating customer details right now" });
}

export {
  customerLogin,
  customerProfile,
  customerSignUp,
  customerUpdateProfile,
  customerVerify,
  requestOTP,
};
