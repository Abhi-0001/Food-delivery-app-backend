import { Router } from "express";
import { addVandor, getVandorById, getVandors } from "../controllers";

const router = Router();

router.post("/vandor", addVandor);
router.get("/vandor", getVandors);
router.get("/vandor/:id", getVandorById);

export { router as AdminRouter };
