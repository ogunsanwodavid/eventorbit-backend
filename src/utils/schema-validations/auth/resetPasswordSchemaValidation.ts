import { z } from "zod";

import validateSchema from "../validateSchema";

const resetPasswordSchemaValidation = validateSchema(
  z.object({
    body: z.object({
      newPassword: z
        .string({ required_error: "New password is required" })
        .min(6, "New password must be at least 6 characters"),
    }),
  })
);

export default resetPasswordSchemaValidation;
