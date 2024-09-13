import { Request, Response, NextFunction } from "express";
import { CreateVandorInput } from "../dto";
import { DeliveryUser, Vandor } from "../models";
import { generateHshPassword, generateSalt } from "../utils";
import { Transaction } from "../models/transaction.model";

// helper functions
async function findVandor(id?: string | undefined, email?: string) {
  if (email) {
    return await Vandor.findOne({ email });
  } else if (id) {
    return await Vandor.findOne({ _id: id });
  } else return await Vandor.find({});
}

async function addVandor(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      name,
      email,
      phone,
      ownerName,
      pincode,
      address,
      password,
      foodType,
      serviceAvailable,
      rating,
    } = <CreateVandorInput>req.body;

    const isExisted = await findVandor("", email);

    if (isExisted)
      return res
        .status(409)
        .json({ message: "Vandor with this email already exist" });

    const hshSalt = await generateSalt();
    const hshPassword = await generateHshPassword(password, hshSalt);

    const createdVandor = await Vandor.create({
      name,
      email,
      phone,
      ownerName,
      pincode,
      address,
      password: hshPassword,
      foodType,
      salt: hshSalt,
      serviceAvailable,
      rating,
    });

    return res.status(200).json(createdVandor);
  } catch (err) {
    console.log("error 🚀🚀: ", err);
    res.status(500).json({ message: err });
  }
}

async function getVandors(req: Request, res: Response) {
  try {
    const vandors = await findVandor();

    res.status(200).json(vandors);
  } catch (err) {
    console.log("ERROR 🚀:", err);
    res.status(500).json({ message: err });
  }
}

async function getVandorById(req: Request, res: Response) {
  try {
    const vandorId = req.params.id;
    const vandor = await findVandor(vandorId);
    if (!vandor)
      return res.status(401).json({ message: "Vandor could not found" });

    return res.status(200).json(vandor);
  } catch (err) {
    console.log("ERROR🚀 :", err);
    res.status(500).json({ message: err });
  }
}

export async function getTxns(req: Request, res: Response) {
  try {
    const txns = await Transaction.find();

    res.status(200).json(txns);
  } catch (err) {
    console.log("ERROR 🚀:", err);
    res.status(500).json({ message: err });
  }
}

export async function getTxnById(req: Request, res: Response) {
  try {
    const txnId = req.params.id;
    const txn = await Transaction.findById(txnId);
    if (!txn) return res.status(401).json({ message: "txn could not found" });

    return res.status(200).json(txn);
  } catch (err) {
    console.log("ERROR🚀 :", err);
    res.status(500).json({ message: err });
  }
}

export async function verifyDeliveryUser(req: Request, res: Response) {
  const { id, status } = req.body;

  if (id) {
    const deliveryUser = await DeliveryUser.findById(id);
    deliveryUser.isVerified = status;

    const result = await deliveryUser.save();
    return res.status(200).json(result);
  }

  return res
    .status(301)
    .json({ message: "no delivery user exist with this id." });
}
export async function getDeliveryUsers(req: Request, res: Response) {
  const deliveryUser = await DeliveryUser.find();

  if (deliveryUser) {
    return res.status(200).json(deliveryUser);
  }

  return res.status(301).json({ message: "no any delivery users." });
}

export { addVandor, getVandors, getVandorById, findVandor };
