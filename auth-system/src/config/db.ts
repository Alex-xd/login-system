/**
 * @fileoverview Database configuration, connect to the MongoDB database.
 */
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // DB_URL is configured in the .env file
    await mongoose.connect(process.env.DB_URL as string);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

export default connectDB;
