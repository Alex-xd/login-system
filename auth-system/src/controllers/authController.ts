/**
 * @fileoverview Auth controller, handle the auth related requests.
 */
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User, TempUser } from "../models/user";
import dotenv from "dotenv";
import * as redis from "redis";
import nodemailer from "nodemailer";
import { ApiResponseUtil } from "../utils/response";
import { HTTP_STATUS } from "../constants/httpStatus";
import { TokenBlacklist } from "../models/tokenBlacklist";

dotenv.config(); // load the environment variables, from .env file

/**
 * Redis client, used for caching.
 */
const redisClient = redis.createClient({
  socket: {
    host: "redis", // use the service name as the host name
    port: 6379,
  },
});
redisClient.connect();

/**
 * Nodemailer transporter, used for sending emails.
 */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT as string, 10),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // must use the authorization code
  },
});

/**
 * @route   POST /auth/send-code
 * @desc    send verification code when registering
 * @access  Public
 */
export const sendCode = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  // check if the email is provided
  if (!email) {
    res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json(ApiResponseUtil.error("Email is required"));
    return;
  }
  // check if the user has already registered
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json(ApiResponseUtil.error("Email already exists"));
    return;
  }
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  await redisClient.setEx(`code:${email}`, 60, code); // 60s expiration time
  //   TODO: prevent the user from clicking the verification code repeatedly
  console.log("sendCode================================================");
  console.log("email:", email);
  console.log("code:", code);
  console.log("sendCode================================================");
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Verification Code",
    text: `Your verification code is: ${code}`,
  });
  // create a temp user, before verifying the email, the user is a temp user
  const newUser = new TempUser({
    email,
  });
  await newUser.save();
  res
    .status(HTTP_STATUS.SUCCESS)
    .json(ApiResponseUtil.success(null, "Verification code sent"));
};

/**
 * @route   POST /auth/verify-code
 * @desc    verify the email verification code
 * @access  Public
 */
export const verifyCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, code } = req.body;
  const storedCode = await redisClient.get(`code:${email}`);

  console.log("verifyCode================================================");
  console.log("email:", email);
  console.log("storedCode:", storedCode);
  console.log("code:", code);
  console.log("verifyCode================================================");
  // check if the verification code is correct
  if (storedCode !== code) {
    res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json(ApiResponseUtil.error("Invalid verification code"));
    return;
  }

  // delete the verification code from the cache
  await redisClient.del(`code:${email}`);
  // update the temp user's otpVerified to true
  await TempUser.updateOne({ email }, { otpVerified: true });
  res
    .status(HTTP_STATUS.SUCCESS)
    .json(ApiResponseUtil.success(null, "Code verified successfully"));
};

/**
 * @route   POST /auth/set-password
 * @desc    set the password
 * @access  Public
 */
export const setPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await TempUser.findOne({ email });
    // check if the user is a temp user and the email is verified
    if (!user || !user.otpVerified) {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(ApiResponseUtil.error("Code not verified"));
      return;
    }
    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // update the temp user's password
    await TempUser.updateOne({ email }, { password: hashedPassword });
    res
      .status(HTTP_STATUS.SUCCESS)
      .json(ApiResponseUtil.success(null, "Password set"));
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(ApiResponseUtil.error("Internal Server Error"));
  }
};
/**
 * @route   POST /auth/register
 * @desc    user registration
 * @access  Public
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, firstName, lastName } = req.body;

    const tempUser = await TempUser.findOne({ email });

    // check if the temp user exists and has a password
    if (!tempUser || !tempUser.password) {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(ApiResponseUtil.error("Incomplete registration"));
      return;
    }

    // migrate data to the official user table
    const newUser = new User({
      email,
      firstName,
      lastName,
      password: tempUser.password,
    });
    await newUser.save();
    await TempUser.deleteOne({ email });

    // generate the JWT token
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );
    res
      .status(HTTP_STATUS.SUCCESS)
      .json(ApiResponseUtil.success(token, "Registration successful"));
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(ApiResponseUtil.error("Internal Server Error"));
  }
};

/**
 * @route   POST /auth/login
 * @desc    user login
 * @access  Public
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(ApiResponseUtil.error("Unauthorized, please log in again."));
      return;
    }

    // check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(ApiResponseUtil.error("Unauthorized, please log in again."));
      return;
    }

    // generate a 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await redisClient.setEx(`login_code:${email}`, 30, code); // 30s后自动删除

    // send the verification code to the user's email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Verification Code",
      text: `Your verification code is: ${code}`,
    });

    res
      .status(HTTP_STATUS.SUCCESS)
      .json(ApiResponseUtil.success(null, "Verification code sent to email"));
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(ApiResponseUtil.error("Internal Server Error"));
  }
};

/**
 * @route   POST /auth/send-code-login
 * @desc    send verification code when logging in
 * @access  Public
 */
export const sendLoginCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json(ApiResponseUtil.error("Email is required"));
    return;
  }
  // generate a 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  await redisClient.setEx(`login_code:${email}`, 30, code); //30s expiration time
  //   TODO: prevent the user from clicking the verification code repeatedly

  // send the verification code to the user's email
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Verification Code",
    text: `Your verification code is: ${code}`,
  });
  res
    .status(HTTP_STATUS.SUCCESS)
    .json(ApiResponseUtil.success(null, "Verification code sent"));
};

/**
 * @route   POST /auth/verify-login
 * @desc    user input the verification code, and the backend verify it, then return the JWT token
 * @access  Public
 */
export const verifyLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email });

    // check if the verification code is correct
    const storedCode = await redisClient.get(`login_code:${email}`);
    if (!storedCode || storedCode !== code) {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(ApiResponseUtil.error("Invalid verification code"));

      return;
    }

    await redisClient.del(`login_code:${email}`); // delete the verification code, prevent the code from being used repeatedly

    // generate the JWT token
    const token = jwt.sign(
      { userId: user?._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res
      .status(HTTP_STATUS.SUCCESS)
      .json(ApiResponseUtil.success(token, "Login successful"));
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(ApiResponseUtil.error("Internal Server Error"));
  }
};

/**
 * @route   POST /auth/signout
 * @desc    user logout
 * @access  Public
 */
export const signOut = async (req: Request, res: Response): Promise<void> => {
  try {
    // get the token
    const token = req.headers.authorization?.split(" ")[1];

    // check if the token is provided
    if (token) {
      try {
        // parse the token to get the expiration time
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET as string
        ) as jwt.JwtPayload;

        // calculate the expiration time
        const expiresAt = new Date((decoded.exp as number) * 1000);
        // add to the blacklist
        await TokenBlacklist.create({
          token,
          expiresAt,
        });

        console.log(`Token added to blacklist, expires at ${expiresAt}`);
      } catch (err) {
        // if the token is expired or invalid, no need to add to the blacklist
        console.error("Invalid token, no need to blacklist:", err);
      }
    }

    res
      .status(HTTP_STATUS.SUCCESS)
      .json(ApiResponseUtil.success(null, "User logged out successfully"));
  } catch (error) {
    console.error("Signout error:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(ApiResponseUtil.error("Server error"));
  }
};
