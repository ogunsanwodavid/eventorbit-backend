import { z } from "zod";

import validateSchema from "./validateSchema";

const verifyEmailValidationSchema = validateSchema(
  z.object({
    query: z.object({
      token: z
        .string({ required_error: "Token is required" })
        .min(1, "Token cannot be empty"),
    }),
  })
);

export default verifyEmailValidationSchema;
