import { IUser } from "../../../mongoose/models/user";

export type SafeUser = Omit<IUser, "password">;

//Function removes password key from user object
export default function getSafeUser(user: IUser): SafeUser {
  const { password, ...safeUser } = user.toObject ? user.toObject() : user;
  return safeUser;
}
