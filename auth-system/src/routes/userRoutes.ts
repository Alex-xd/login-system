/**
 * @fileoverview handle the user routes.
 */
import express, { RequestHandler } from "express";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
} from "../controllers/userController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = express.Router();

/**
 * @route   GET /users/profile
 * @desc    get user profile
 * @access  Private (need to login)
 */
router.get("/profile", authenticateToken, getUserProfile as RequestHandler);

/**
 * @route   PUT /users/update
 * @desc    update user profile
 * @access  Private (need to login)
 */
router.put("/update", authenticateToken, updateUserProfile as RequestHandler);

/**
 * @route   PUT /users/change-password
 * @desc    change password
 * @access  Private (need to login)
 */
router.put(
  "/change-password",
  authenticateToken,
  changePassword as RequestHandler,
);

export default router;
