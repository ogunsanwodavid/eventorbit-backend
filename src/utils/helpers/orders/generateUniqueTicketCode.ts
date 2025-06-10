import { randomBytes } from "crypto";

import { TicketModel } from "../../../mongoose/models/ticket";

//Allowed characters (excludes 0/O/1/I for readability)
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

async function generateUniqueTicketCode(): Promise<string> {
  const CODE_LENGTH = 8;
  let attempts = 0;
  const MAX_ATTEMPTS = 15;

  while (attempts < MAX_ATTEMPTS) {
    //Generate random code
    const bytes = randomBytes(CODE_LENGTH);
    let code = "";

    for (let i = 0; i < CODE_LENGTH; i++) {
      const index = bytes[i] % ALPHABET.length;
      code += ALPHABET[index];
    }

    //Verify uniqueness
    const exists = await TicketModel.exists({ code });
    if (!exists) return code;

    attempts++;
  }

  throw new Error("Failed to generate unique ticket code after retries");
}

export default generateUniqueTicketCode;
