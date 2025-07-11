import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import { User } from "../mongoose/models/user";

import dotenv from "dotenv";

//Configure env variables
dotenv.config();

const googleSignInStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_OAUTH_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_OAUTH_CALLBACK_URL!,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      //User's email
      const email = profile.emails?.[0]?.value;

      //Find user from database
      let user = await User.findOne({ email });

      //Flag if user already exists
      const isExistingUser = !!user;

      //Create user if not in database
      if (!user) {
        user = await User.create({
          email,
          firstName: profile.name?.givenName || "",
          lastName: profile.name?.familyName || "",
          profilePicture: profile.photos?.[0]?.value || undefined,
          userType: "individual",
          isVerified: true,
          isGoogle: true,
        });
      }

      //Return user object with isExistingUser flag
      done(null, { ...user.toObject(), isExistingUser });
    } catch (err) {
      done(err);
    }
  }
);

/*       //Create user if not in database
      if (!user) {
        user = await User.create({
          email,
          firstName: profile.name?.givenName || "",
          lastName: profile.name?.familyName || "",
          profilePicture: profile.photos?.[0]?.value || undefined,
          userType: "individual",
          isVerified: true,
          isGoogle: true,
        });
      }

      //Return user's object
      done(null, user);
    } catch (err) {
      done(err);
    }
  }
); */

export default googleSignInStrategy;
