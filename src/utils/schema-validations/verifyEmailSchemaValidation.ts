import { z } from "zod";

import validateSchema from "./validateSchema";

export const verifyEmailValidationSchema = validateSchema(
  z.object({
    query: z.object({
      token: z
        .string({ required_error: "Token is required" })
        .min(1, "Token cannot be empty"),
    }),
  })
);
