import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { SALT_ROUNDS } from "../utils/constants";
import { AuthPayload } from "../dto";

async function generateSalt() {
  return await bcrypt.genSalt(SALT_ROUNDS);
}

async function generateHshPassword(password: string, hshSalt: string) {
  return await bcrypt.hash(password, hshSalt);
}

async function validatePassword(enteredPassword: string, hashedPass: string) {
  return await bcrypt.compare(enteredPassword, hashedPass);
}

async function generateLoginToken(payload: AuthPayload) {
  return jwt.sign(payload, String(process.env.API_TOKEN_SECRET), {
    expiresIn: process.env.API_TOKEN_EXPIRY,
  });
}

async function validateToken(req: Request, res: Response) {
  const signature = <string>req.headers["authorization"];
  const token = signature.split(" ")[1];

  if (token) {
    try {
      const payload = jwt.verify(token, String(process.env.API_TOKEN_SECRET));
      req.user = <AuthPayload>payload;
      return true;
    } catch (err) {
      res.status(401).json({ message: "Session expired. Please login Again" });
    }
  }
  return false;
}

export {
  generateHshPassword,
  generateSalt,
  validatePassword,
  generateLoginToken,
  validateToken,
};
