import express, { Application } from "express";
import dotenv from "dotenv";
import { BASE_URL } from "../utils/constants";
import { AdminRouter } from "../routes";
import { VandorRouter } from "../routes";
import { shoppingRouter } from "../routes";
import { customerRouter } from "../routes";

async function expressService(app: Application) {
  dotenv.config();
  // setting json parser without it req.body will be undefined.
  app.use(express.json());
  app.use(`${BASE_URL}`, shoppingRouter);

  app.use(`${BASE_URL}/admin`, AdminRouter);
  app.use(`${BASE_URL}/vandor`, VandorRouter);
  app.use(`${BASE_URL}/customer`, customerRouter);
}

export default expressService;
