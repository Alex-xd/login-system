/**
 * @fileoverview handle the passkey routes.
 */
import express, { RequestHandler } from "express";
import {
  getAuthenticationOptions,
  verifyAuthentication,
  getRegistrationOptions,
  verifyRegistration,
  getPasskeys,
  deletePasskey,
} from "../controllers/passkeyController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = express.Router();

// public routes - no authentication required
router.get("/auth-options", getAuthenticationOptions); // get authentication options
router.post("/auth-verify", verifyAuthentication); // verify authentication

// private routes - authentication required
router.post(
  "/register-options",
  authenticateToken,
  getRegistrationOptions as RequestHandler,
); // get registration options
router.post(
  "/register-verify",
  authenticateToken,
  verifyRegistration as RequestHandler,
); // verify registration
router.get("/list", authenticateToken, getPasskeys as RequestHandler); // get passkeys
router.delete("/:id", authenticateToken, deletePasskey as RequestHandler); // delete passkey

export default router;
