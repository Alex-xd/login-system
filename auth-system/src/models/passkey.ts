/**
 * @fileoverview Passkey model, define the schema for passkey credential and session.
 */
import mongoose, { Schema, Document } from "mongoose";

/**
 * Passkey credential, used for passkey authentication.
 */
export interface IPasskeyCredential extends Document {
  userId: mongoose.Types.ObjectId;
  credentialID: string;
  credentialPublicKey: Buffer;
  counter: number;
  deviceName: string;
  createdAt: Date;
}

/**
 * Passkey credential schema, with specified fields.
 */
const PasskeyCredentialSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  credentialID: {
    type: String,
    required: true,
    unique: true,
  },
  credentialPublicKey: {
    type: Buffer,
    required: true,
  },
  counter: {
    type: Number,
    required: true,
    default: 0,
  },
  deviceName: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Passkey session, used for passkey authentication.
 */
export interface IPasskeySession extends Document {
  sessionId: string;
  challenge: string;
  expectedOrigin: string;
  expectedRPID: string;
  userId?: mongoose.Types.ObjectId;
  status: "pending" | "completed" | "expired";
  userVerification?: "required" | "preferred" | "discouraged";
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Passkey session schema, with specified fields.
 */
const PasskeySessionSchema: Schema = new Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
  challenge: {
    type: String,
    required: true,
  },
  expectedOrigin: {
    type: String,
    required: true,
  },
  expectedRPID: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  status: {
    type: String,
    enum: ["pending", "completed", "expired"],
    default: "pending",
  },
  userVerification: {
    type: String,
    enum: ["required", "preferred", "discouraged"],
    default: "preferred",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

/**
 * Passkey credential model
 */
export const PasskeyCredential = mongoose.model<IPasskeyCredential>(
  "PasskeyCredential",
  PasskeyCredentialSchema,
);

/**
 * Passkey session model
 */
export const PasskeySession = mongoose.model<IPasskeySession>(
  "PasskeySession",
  PasskeySessionSchema,
);
