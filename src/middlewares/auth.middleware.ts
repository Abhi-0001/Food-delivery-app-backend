import { NextFunction, Response, Request } from "express";
import { AuthPayload } from "../dto/auth.dto";
import { validateToken } from "../utils/password.utils";

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

async function authenticate(req: Request, res: Response, next: NextFunction) {
  const validate = await validateToken(req, res);
  if (validate) {
    next();
    return;
  }
  if (res.headersSent) return;
  return res.status(404).json({ message: "Unauthorized access" });
}

export { authenticate };
