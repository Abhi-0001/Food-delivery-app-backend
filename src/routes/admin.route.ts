import { Router } from "express";
import {
  addVandor,
  getDeliveryUsers,
  getTxnById,
  getTxns,
  getVandorById,
  getVandors,
  verifyDeliveryUser,
} from "../controllers";

const router = Router();

router.post("/vandor", addVandor);
router.get("/vandor", getVandors);
router.get("/vandor/:id", getVandorById);

router.get("/transaction", getTxns);
router.get("/transaction/:id", getTxnById);

router.post("/delivery/verify", verifyDeliveryUser);
router.get("/delivery/users", getDeliveryUsers);

export { router as AdminRouter };
