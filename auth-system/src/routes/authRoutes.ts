/**
 * @fileoverview handle the authentication routes.
 */
import express from "express";
import {
  signOut,
  sendLoginCode,
  verifyCode,
  verifyLogin,
  sendCode,
  setPassword,
  register,
  login,
  enable2FA,
  verify2FA,
} from "../controllers/authController";
import { authenticateToken } from "../middlewares/authMiddleware";
import passport from "passport";
import { handleGoogleCallback } from "../controllers/googleAuthController";

const router = express.Router();

/**
 * @route   POST /auth/send-code
 * @desc    send verification code when user register
 * @access  Public
 */
router.post("/send-code", sendCode);
/**
 * @route   POST /auth/verify-code
 * @desc    verify email verification code
 * @access  Public
 */
router.post("/verify-code", verifyCode);
/**
 * @route   POST /auth/set-password
 * @desc    set password
 * @access  Public
 */
router.post("/set-password", setPassword);
/**
 * @route   POST /auth/register
 * @desc    user register
 * @access  Public
 */
router.post("/register", register);

/**
 * @route   POST /auth/login
 * @desc    user login
 * @access  Public
 */
router.post("/login", login);

/**
 * @route   POST /auth/send-code-login
 * @desc    send verification code when user login
 * @access  Public
 */
router.post("/send-code-login", sendLoginCode);

/**
 * @route   POST /auth/verify-login
 * @desc    user input verification code, then backend verify and return JWT token
 * @access  Public
 */
router.post("/verify-login", verifyLogin);

// 添加到路由定义部分
/**
 * @route   GET /auth/google
 * @desc    start Google OAuth2 authorization process
 * @access  Public
 */
router.get(
  "/google",
  (req, res, next) => {
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

/**
 * @route   GET /auth/google/callback
 * @desc    handle Google OAuth2 callback
 * @access  Public
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/signin?error=google_auth_failed",
    session: true,
  }),
  handleGoogleCallback,
);

/**
 * @route   POST /auth/signout
 * @desc    user logout
 * @access  Public
 */

router.post("/signout", signOut);

export default router;
