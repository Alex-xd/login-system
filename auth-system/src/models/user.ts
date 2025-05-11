/**
 * @fileoverview User model, define the schema for user.
 */
import mongoose from "mongoose";

/**
 * User schema, with specified fields.
 */
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  password: { type: String, required: true },
});

/**
 * Temp user schema, before verifying the email, the user is a temp user.
 */
const TempUserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otpVerified: { type: Boolean, default: false },
  password: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  createdAt: { type: Date, default: Date.now, expires: 1800 }, // 30 minutes later, the temp user will be deleted
});

export const TempUser = mongoose.model("TempUser", TempUserSchema);
export const User = mongoose.model("User", UserSchema);
