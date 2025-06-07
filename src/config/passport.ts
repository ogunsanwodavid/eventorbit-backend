import passport from "passport";

import { User } from "../mongoose/models/user";

import googleSignInStrategy from "../strategies/googleSignInStrategy";

//Utilize auth strategies
passport.use(googleSignInStrategy);

//Serialize user to store in session
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

//Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
