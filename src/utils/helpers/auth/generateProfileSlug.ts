import { IUser } from "../../../mongoose/models/user";

import generateRandomLetters from "./generateRandomLetters";

// Helper to slugify a string: lowercase, replace spaces with dashes, remove non-alphanumeric chars (except dash)
const slugify = (str: string) =>
  str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

export default function generateProfileSlug(user: IUser): string {
  const randomLetters = generateRandomLetters();

  if (user.userType === "individual" && user.firstName && user.lastName) {
    const first = slugify(user.firstName);
    const last = slugify(user.lastName);
    return `${first}-${last}-${randomLetters}`;
  }

  if (user.userType === "organization" && user.organizationName) {
    const org = slugify(user.organizationName);
    return `${org}-${randomLetters}`;
  }

  // Fallback
  return `user-${randomLetters}`;
}
