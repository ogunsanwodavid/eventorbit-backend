import "express-session";

import { IUser } from "../../mongoose/models/user";

declare module "express-session" {
  interface SessionData {
    user: IUser;
  }
}
