import { NextFunction, Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import {
  cartItem,
  CreateCustomerInput,
  CustomerLoginInput,
  CustomerUpdateInput,
  orderInputs,
} from "../dto/index";
import { validate } from "class-validator";
import { Customer, CustomerDoc, Food, Order } from "../models";
import {
  generateHshPassword,
  generateLoginToken,
  generateOTP,
  generateSalt,
  validatePassword,
} from "../utils";
import { onRequestOTP } from "../services/sms.service";
import { Offer, OfferDoc } from "../models/offer.model";
import { Transaction } from "../models/transaction.model";

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
    cart: [],
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

// *********** VERIFY OFFER ***************

export async function verifyOffer(req: Request, res: Response) {
  try {
    const user = req.user;
    const cusomter = await Customer.findById(user.id);
    if (!cusomter) throw new Error("customer doesn't exist");

    const offerId = req.params.id;
    let appliedOffer: OfferDoc | undefined;
    try {
      appliedOffer = await Offer.findById(offerId);
    } catch (err) {
      throw new Error("Applied offer is not found");
    }

    if (!appliedOffer) throw new Error("Applied offer is invalid");

    if (appliedOffer.promoType === "USER") {
      // * offer is valid once only
    } else {
      if (appliedOffer.isActive) {
        return res.status(200).json({ isValid: true, offer: appliedOffer });
      }
      return res.status(400).json({ isValid: false });
    }
  } catch (err) {
    console.error("🚀", err);
    res.status(500).json({ message: err.message });
  }
}

// ****************** CART SECTION ***********
export async function addToCart(req: Request, res: Response) {
  try {
    const customer = req.user;
    if (!customer) throw new Error("please login first");
    const existingCustomer = await Customer.findById(customer.id).populate(
      "cart.food"
    );

    const customerCart = existingCustomer.cart;

    const { id, unit } = <cartItem>req.body;

    const food = await Food.findById(id);

    const isAlreadyExistItem = customerCart.filter(
      (item) => item.food._id.toString() === food._id.toString()
    );

    if (isAlreadyExistItem.length) {
      const existedItemIndex = customerCart.findIndex(
        (item) =>
          item.food._id.toString() === isAlreadyExistItem[0].food._id.toString()
      );

      existingCustomer.cart[existedItemIndex].unit = unit;
    } else {
      existingCustomer.cart.push({ food, unit });
    }
    const result = await existingCustomer.save();
    return res
      .status(201)
      .json({ message: "item added to the cart", cart: result.cart });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
}
export async function getCart(req: Request, res: Response) {
  try {
    const customer = req.user;
    if (!customer) throw new Error("Login please");

    const exitedCustomer = await Customer.findById(customer.id).populate(
      "cart.food"
    );

    return res.status(200).json({ cart: exitedCustomer.cart });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
}
export async function deleteAllCartItems(req: Request, res: Response) {
  try {
    const cusomter = req.user;
    const existingCustomer = await Customer.findById(cusomter.id);
    existingCustomer.cart = null;
    existingCustomer.save();
    return res.status(200).json({ message: "Cart deleted succefully" });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
}

// ******** PAYMENT
export async function createPayment(req: Request, res: Response) {
  try {
    const user = req.user;
    const customer = await Customer.findById(user.id);
    const { offerId, amount, paymentMode } = req.body;
    let payableAmount = amount;

    // * check offer applied or not
    let appliedOffer: OfferDoc | undefined;
    try {
      if (offerId) appliedOffer = await Offer.findById(offerId);
    } catch (err) {
      throw new Error("Applied offer is not found");
    }
    if (appliedOffer && appliedOffer.isActive) {
      payableAmount = payableAmount - appliedOffer.offerAmount;
    }

    // * payment gateway API call

    // * success/failure transaction

    // * Create Transaction data
    const transaction = await Transaction.create({
      customer: customer._id,
      vandorId: "",
      orderId: "",
      orderValue: payableAmount,
      offerUsed: appliedOffer._id || null,
      status: "OPEN",
      paymentMode,
      paymentResponse: "",
    });
    return res.status(200).json({ message: "payment succesfull", transaction });
  } catch (err) {
    console.error(err);
    res.json({ message: err.message });
  }
}

// ****************** ORDER SECTION ***********

async function validateTransaction(txnId: string) {
  const currentTxn = await Transaction.findById(txnId);
  if (currentTxn) {
    if (currentTxn.status.toLowerCase() !== "failed") {
      return { status: true, currentTxn };
    }
  }
  return { status: false, currentTxn };
}

export async function createOrder(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // * identify customer
  const customer = req.user;

  const { txnId, amount, items } = <orderInputs>req.body;

  // * validate txn
  const { status, currentTxn } = await validateTransaction(txnId);
  if (!status)
    return res
      .status(500)
      .json({ message: "order could not be placed please try again" });

  if (customer) {
    // * find customer's profile
    const profile = (await Customer.findById(customer.id)) as CustomerDoc;

    //   * create order id
    const orderId = Date.now().toString().slice(-6, -1);

    let cartItems = [];
    let netAmount: number = 0.0;

    // * Calculate price
    const foods = await Food.find()
      .where("_id")
      .in(items.map((item) => item.id))
      .exec();

    let vandorId: string;
    foods.forEach((foodItem) => {
      items.forEach(({ id, unit }) => {
        if (id === String(foodItem._id)) {
          vandorId = foodItem.vandorId;
          netAmount += foodItem.price * unit;
          cartItems.push({ food: foodItem, unit });
        }
      });
    });

    // * Calculate ready time :
    let readyTime: number = 0;
    cartItems.forEach((item) => {
      readyTime += item.food.readyTime;
    });
    readyTime = readyTime / cartItems.length; // average timing

    // * Create order
    const order = await Order.create({
      orderId,
      vandorId,
      readyTime,
      items: cartItems,
      totalAmount: netAmount,
      paidAmount: amount,
      orderDate: new Date().toISOString(),
      orderStatus: "waiting",
    });

    // * txn update
    currentTxn.status = "Succesfull";
    currentTxn.vandorId = vandorId;
    currentTxn.orderId = orderId;
    await currentTxn.save();

    // * save order
    await order.save();

    // * empty the cart
    profile.cart = [] as any;

    //   * save customer profile
    profile.orders.push(order);
    await profile.save();

    // * send response
    return res
      .status(200)
      .json({ message: "order created succesfully", order });
  }

  return res.status(404).json({ message: "please login first" });
}

export async function getOrders(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const customer = req.user;

  if (customer) {
    const orders = (await Customer.findById(customer.id).populate("orders"))
      .orders;
    return res.status(200).json(orders);
  }
  return res.status(404).json({ message: "unauthorized access" });
}

export async function getOrderById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const customer = req.user;

    if (customer) {
      const orderId = req.params.id;
      const order = await Order.findById(orderId);

      return res.status(200).json(order);
    }
    return res.status(404).json({ message: "unauthorized access" });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
}

export {
  customerLogin,
  customerProfile,
  customerSignUp,
  customerUpdateProfile,
  customerVerify,
  requestOTP,
};
