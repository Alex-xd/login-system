/**
 * @fileoverview Google authentication controller, handle the Google authentication callback.
 */
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

/**
 * Load the environment variables from the .env file
 */
dotenv.config();

/**
 * Handle the Google authentication callback
 */
export const handleGoogleCallback = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // the user has already been verified by Google, req.user has been filled
    if (!req.user) {
      res.redirect(
        `${process.env.CLIENT_ORIGIN}/signin?error=authentication_failed`,
      );
      return;
    }

    const user = req.user as any;
    // generate the JWT token, expires in 1 hour
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" },
    );

    // redirect to the frontend application and pass the token
    // it is recommended to use a one-time token or status parameter to enhance security
    res.redirect(`${process.env.CLIENT_ORIGIN}/auth/callback?token=${token}`);
  } catch (error) {
    res.redirect(`${process.env.CLIENT_ORIGIN}/signin?error=server_error`);
  }
};
