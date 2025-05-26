import { z } from "zod";

import validateSchema from "../validateSchema";

const forgotPasswordSchemaValidation = validateSchema(
  z.object({
    body: z.object({
      email: z
        .string({ required_error: "Email is required" })
        .email("Invalid email address"),
    }),
  })
);

export default forgotPasswordSchemaValidation;
