import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

declare global {
  namespace Express {
    interface User {
      _id: string;
      email: string;
      firstName: string;
      lastName: string;
    }
  }
}
