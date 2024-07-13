import { Request, Response, NextFunction } from "express";
import { CreateVandorInput } from "../dto";
import { Vandor } from "../models";
import { generateHshPassword, generateSalt } from "../utils";

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

export { addVandor, getVandors, getVandorById, findVandor };
