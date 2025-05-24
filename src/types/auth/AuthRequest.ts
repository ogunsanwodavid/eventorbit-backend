import { Request } from "express";
import { SafeUser } from "./SafeUser";
import { IUser } from "../../mongoose/models/user";

export default interface AuthRequest extends Request {
  user?: IUser;
}
