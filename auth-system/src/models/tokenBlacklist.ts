/**
 * @fileoverview Token blacklist model, used for token blacklist.
 */
import mongoose, { Document, Schema } from "mongoose";

/**
 * Token blacklist schema, with specified fields.
 */
interface ITokenBlacklist extends Document {
  token: string;
  createdAt: Date;
  expiresAt: Date;
}

const TokenBlacklistSchema = new Schema<ITokenBlacklist>({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "1h", // MongoDB TTL index - 自动删除1小时后的文档
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

export const TokenBlacklist = mongoose.model<ITokenBlacklist>(
  "TokenBlacklist",
  TokenBlacklistSchema,
);
