/**
 * This is the main entry point for the authentication system.
 *
 * @file src/app.ts
 * @module src/app
 * @fileoverview handle the authentication system.
 */
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import passkeyRoutes from "./routes/passkeyRoutes";
import passport from "passport";
import session from "express-session";
import setupPassport from "./config/passport";

dotenv.config(); // load .env file

// initialize the Express application
const app = express();

// security middleware
app.use(helmet()); // protect HTTP headers
app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true })); // allow cross-origin requests
app.use(express.json()); // parse JSON request bodies
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // parse cookies

// session middleware
app.use(
  session({
    secret: process.env.JWT_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    }, // save session in cookie for 24 hours
  }),
);
app.use(morgan("dev")); // log requests
// initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// setup Passport strategies
setupPassport();

// limit request frequency (prevent brute force attacks)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP
});
app.use(limiter);

// connect to MongoDB
connectDB();

// mount routes
app.use("/auth", authRoutes); // authentication routes
app.use("/users", userRoutes); // user routes
app.use("/auth/passkey", passkeyRoutes); // passkey routes

// handle root request
app.get("/", (req, res) => {
  res.send("Authentication API is running...");
});

export default app;
