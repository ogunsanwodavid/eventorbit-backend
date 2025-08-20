import { z } from "zod";

import validateSchema from "../validateSchema";

const forgotPasswordSchemaValidation = validateSchema(
  z.object({
    body: z.object({
      email: z
        .string({ required_error: "Email is required" })
        .email("Invalid email address"),
      pageRedirect: z
        .string({ required_error: "Page redirect is required" })
        .optional(),
    }),
  })
);

export default forgotPasswordSchemaValidation;
