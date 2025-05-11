/**
 * @fileoverview User controller, handle the user profile and password change.
 */
import { Response } from "express";
import { AuthenticatedRequest } from "../types/express";
import { User } from "../models/user";
import bcrypt from "bcrypt";
import { HTTP_STATUS } from "../constants/httpStatus";
import { ApiResponseUtil } from "../utils/response";

/**
 * @route   GET /users/profile
 * @desc    get the user's profile information
 * @access  Private (need to login)
 */
export const getUserProfile = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user || !req.user.userId) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(ApiResponseUtil.error("Unauthorized"));
      return;
    }

    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      res
        .status(HTTP_STATUS.NOT_FOUND)
        .json(ApiResponseUtil.error("User not found"));
      return;
    }

    res
      .status(HTTP_STATUS.SUCCESS)
      .json(ApiResponseUtil.success(user, "successful"));
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(ApiResponseUtil.error("Server error"));
  }
};

/**
 * @route   PUT /users/update
 * @desc    update the user's profile information
 * @access  Private (need to login)
 */
export const updateUserProfile = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user || !req.user.userId) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(ApiResponseUtil.error("Unauthorized"));

      return;
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      res
        .status(HTTP_STATUS.NOT_FOUND)
        .json(ApiResponseUtil.error("User not found"));

      return;
    }

    console.log("req", req);

    // update the user's profile information
    if (req.body.email) user.email = req.body.email;
    if (req.body.firstName) user.firstName = req.body.firstName;
    if (req.body.lastName) user.lastName = req.body.lastName;

    await user.save();
    res
      .status(HTTP_STATUS.SUCCESS)
      .json(ApiResponseUtil.success(user, "User profile updated"));
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(ApiResponseUtil.error("Server error"));
  }
};

/**
 * @route   PUT /users/change-password
 * @desc    change the password
 * @access  Private (need to login)
 */
export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const { oldPassword, newPassword } = req.body;

  try {
    if (!req.user || !req.user.userId) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(ApiResponseUtil.error("Unauthorized"));

      return;
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      res
        .status(HTTP_STATUS.NOT_FOUND)
        .json(ApiResponseUtil.error("User not found"));

      return;
    }

    // check if the old password and new password are provided
    if (!oldPassword || !newPassword) {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(
          ApiResponseUtil.error("Old password and new password are required"),
        );
      return;
    }

    // check if the old password is correct
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(ApiResponseUtil.error("Incorrect current password"));
      return;
    }

    // update the user's password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res
      .status(HTTP_STATUS.SUCCESS)
      .json(ApiResponseUtil.success(null, "Password changed successfully"));
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(ApiResponseUtil.error("Server error"));
  }
};
