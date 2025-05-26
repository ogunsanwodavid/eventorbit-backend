import "express-session";

import { IUser } from "../../mongoose/models/user";

declare module "express-session" {
  interface SessionData {
    user: IUser;
    oauthLocation?: {
      latitude?: number;
      longitude?: number;
    };
    resetToken?: string;
    resetUserId?: string;
    resetAttempts?: number;
  }
}
