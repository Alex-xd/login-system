/**
 * @fileoverview Passport configuration, handle the Google authentication.
 */
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user";
import dotenv from "dotenv";

// const HttpsProxyAgent = require('https-proxy-agent');

dotenv.config();

// configure the Google strategy
const setupPassport = () => {
  // use the Google OAuth2.0 strategy

  const gStrategy = new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
      scope: ["profile", "email"],
      state: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // check if the user exists
        let user = await User.findOne({ email: profile.emails?.[0].value });
        if (user) {
          // user exists, return the user information
          return done(null, user);
        } else {
          // user does not exist, create a new user
          const newUser = new User({
            email: profile.emails?.[0].value,
            firstName: profile.name?.givenName || "",
            lastName: profile.name?.familyName || "",
            // since it is an OAuth login, set a random password
            password: require("crypto").randomBytes(16).toString("hex"),
          });
          await newUser.save();
          return done(null, newUser);
        }
      } catch (error) {
        return done(error as Error);
      }
    },
  );

  // use the strategy defined above
  passport.use(gStrategy);

  // serialize and deserialize the user
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};

export default setupPassport;
