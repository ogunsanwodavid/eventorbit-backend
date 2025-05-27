import crypto from "crypto";

//Generate five random uppercase letters
export default function generateRandomLetters(): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randomBytes = crypto.randomBytes(5);
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += letters[randomBytes[i] % letters.length];
  }
  return result;
}
