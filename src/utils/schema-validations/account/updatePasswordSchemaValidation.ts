import { z } from "zod";

import validateSchema from "../validateSchema";

const updatePasswordSchemaValidation = validateSchema(
  z.object({
    body: z.object({
      oldPassword: z.string({ required_error: "Old password is required" }),
      newPassword: z
        .string({ required_error: "New password is required" })
        .min(6, "New password must be at least 6 characters"),
    }),
  })
);

export default updatePasswordSchemaValidation;
