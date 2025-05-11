/**
 * @fileoverview Passkey authentication controller, handle the passkey authentication.
 */
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server"; // passkey authentication library
import jwt from "jsonwebtoken"; // JWT token library
import { PasskeyCredential, PasskeySession } from "../models/passkey"; // passkey credential and session model
import { User } from "../models/user";
import { AuthenticatedRequest } from "../types/express";
import { HTTP_STATUS } from "../constants/httpStatus";
import { ApiResponseUtil } from "../utils/response";
// import * as nodeCrypto from 'crypto';

// (global as any).crypto = nodeCrypto.webcrypto;

// environment configuration
const rpName = process.env.RP_NAME || "Your App";
const rpID = process.env.RP_ID || "localhost"; // rp means the registered authenticator
const expectedOrigin = process.env.EXPECTED_ORIGIN || "http://localhost:5173";
const SESSION_EXPIRY_MINUTES = 5;

/**
 * @route   POST /auth/passkey/register-options
 * @desc    get the passkey registration options
 * @access  Private (need to login)
 */
export const getRegistrationOptions = async (
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

    // get the existing credentials of the user to exclude
    const existingCredentials = await PasskeyCredential.find({
      userId: user._id,
    });
    const excludeCredentials = existingCredentials.map((credential) => ({
      id: credential.credentialID,
    }));

    // generate the registration options
    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: Buffer.from(user._id.toString()),
      userName: user.email,
      userDisplayName: `${user.firstName} ${user.lastName}`,
      excludeCredentials: excludeCredentials, // exclude the existing credentials
      authenticatorSelection: {
        userVerification: "preferred",
        residentKey: "required",
        // authenticatorAttachment: 'platform'
      },
    });

    // save the current challenge to the session, for later verification
    const sessionId = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_EXPIRY_MINUTES * 60000);

    // create a new session
    const session = new PasskeySession({
      sessionId,
      challenge: options.challenge, // challenge is one-time token to prevent replay attacks
      expectedOrigin,
      expectedRPID: rpID,
      userId: user._id,
      status: "pending",
      createdAt: now,
      expiresAt,
    });
    await session.save();

    res.status(HTTP_STATUS.SUCCESS).json(
      ApiResponseUtil.success({
        options,
        sessionId,
      }),
    );
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(ApiResponseUtil.error("Internal Server Error"));
  }
};

/**
 * @route   POST /auth/passkey/register-verify
 * @desc    verify and complete the passkey registration
 * @access  Private (need to login)
 */
export const verifyRegistration = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { sessionId, credential, deviceName } = req.body;

    if (!req.user || !req.user.userId) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(ApiResponseUtil.error("Unauthorized"));
      return;
    }

    // find the corresponding session and challenge
    const session = await PasskeySession.findOne({
      sessionId,
      status: "pending",
    });
    if (!session || session.expiresAt < new Date()) {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(ApiResponseUtil.error("Invalid or expired session"));
      return;
    }

    // verify the registration response
    let verification;
    try {
      verification = await verifyRegistrationResponse({
        response: credential,
        expectedChallenge: session.challenge,
        expectedOrigin: session.expectedOrigin,
        expectedRPID: session.expectedRPID,
      });
    } catch (error) {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(ApiResponseUtil.error("Verification failed"));
      return;
    }

    const { verified, registrationInfo } = verification;

    if (!verified || !registrationInfo) {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(ApiResponseUtil.error("Registration verification failed"));
      return;
    }

    // save the new credential
    const newCredential = new PasskeyCredential({
      userId: req.user.userId,
      credentialID: Buffer.from(registrationInfo.credential.id).toString(
        "base64",
      ),
      credentialPublicKey: Buffer.from(registrationInfo.credential.publicKey),
      counter: registrationInfo.credential.counter,
      deviceName: deviceName || "Unknown device",
    });
    await newCredential.save();

    // update the session status
    session.status = "completed";
    await session.save();

    res
      .status(HTTP_STATUS.SUCCESS)
      .json(ApiResponseUtil.success(null, "Passkey registered successfully"));
  } catch (error) {
    console.error(error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(ApiResponseUtil.error("Internal Server Error"));
  }
};

/**
 * @route   GET /auth/passkey/auth-options
 * @desc    get the passkey authentication options (single device login)
 * @access  Public
 */
export const getAuthenticationOptions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // generate a new session ID and challenge
    const sessionId = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_EXPIRY_MINUTES * 60000);

    // generate the authentication options
    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: "preferred",
      // do not specify allowCredentials, allow any registered credentials
      // if you want to limit the specific user's credentials, get the userID from the cookie or request parameters
    });

    // create a new session
    const session = new PasskeySession({
      sessionId,
      challenge: options.challenge,
      expectedOrigin,
      expectedRPID: rpID,
      status: "pending",
      createdAt: now,
      expiresAt,
    });
    await session.save();

    res.status(HTTP_STATUS.SUCCESS).json(
      ApiResponseUtil.success({
        options,
        sessionId,
      }),
    );
  } catch (error) {
    console.error(error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(ApiResponseUtil.error("Internal Server Error"));
  }
};

/**
 * @route   POST /auth/passkey/auth-verify
 * @desc    verify the passkey authentication and complete the login
 * @access  Public
 */
export const verifyAuthentication = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { sessionId, credential } = req.body;

    // find the session record
    const session = await PasskeySession.findOne({
      sessionId,
      status: "pending",
    });

    if (!session || session.expiresAt < new Date()) {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(ApiResponseUtil.error("Invalid or expired session"));
      return;
    }

    // find the corresponding credential from the credentialId
    const credentialId = Buffer.from(credential.id).toString("base64");

    const passkeyCredential = await PasskeyCredential.findOne({
      credentialID: credentialId,
    });

    if (!passkeyCredential) {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(ApiResponseUtil.error("Unknown credential"));
      return;
    }

    // verify the authentication response
    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        response: credential,
        expectedChallenge: session.challenge,
        expectedOrigin: session.expectedOrigin,
        expectedRPID: session.expectedRPID,
        credential: {
          id: passkeyCredential.credentialID,
          publicKey: passkeyCredential.credentialPublicKey,
          counter: passkeyCredential.counter,
        },
      });
    } catch (error) {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(ApiResponseUtil.error("Verification failed"));
      return;
    }
    const { verified, authenticationInfo } = verification;

    if (!verified) {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(ApiResponseUtil.error("Authentication failed"));
      return;
    }

    // update the credential counter
    passkeyCredential.counter = authenticationInfo.newCounter;
    await passkeyCredential.save();

    // find the user
    const user = await User.findById(passkeyCredential.userId);
    if (!user) {
      res
        .status(HTTP_STATUS.NOT_FOUND)
        .json(ApiResponseUtil.error("User not found"));
      return;
    }

    // generate the JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" },
    );

    // update the session status and associate the userID
    session.status = "completed";
    session.userId = user._id;
    await session.save();

    res.status(HTTP_STATUS.SUCCESS).json(
      ApiResponseUtil.success(
        {
          token,
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        },
        "Authentication successful",
      ),
    );
  } catch (error) {
    console.error(error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(ApiResponseUtil.error("Internal Server Error"));
  }
};

/**
 * @route   GET /auth/passkey/list
 * @desc    get the passkey list of the user
 * @access  Private
 */
export const getPasskeys = async (
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

    const passkeys = await PasskeyCredential.find({ userId: req.user.userId })
      .select("credentialID deviceName createdAt")
      .sort("-createdAt");

    res.status(HTTP_STATUS.SUCCESS).json(ApiResponseUtil.success(passkeys));
  } catch (error) {
    console.error(error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(ApiResponseUtil.error("Internal Server Error"));
  }
};

/**
 * @route   DELETE /auth/passkey/:id
 * @desc    delete the passkey
 * @access  Private
 */
export const deletePasskey = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user || !req.user.userId) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(ApiResponseUtil.error("Unauthorized"));
      return;
    }

    const result = await PasskeyCredential.deleteOne({
      _id: id,
      userId: req.user.userId,
    });

    if (result.deletedCount === 0) {
      res
        .status(HTTP_STATUS.NOT_FOUND)
        .json(
          ApiResponseUtil.error("Passkey not found or not owned by this user"),
        );
      return;
    }

    res
      .status(HTTP_STATUS.SUCCESS)
      .json(ApiResponseUtil.success(null, "Passkey deleted successfully"));
  } catch (error) {
    console.error(error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(ApiResponseUtil.error("Internal Server Error"));
  }
};
