import { IUser } from "../../mongoose/models/user";

export type SafeUser = Omit<IUser, "password">;
