import { z } from "zod";

import validateSchema from "../validateSchema";

const updateEmailSchemaValidation = validateSchema(
  z.object({
    body: z.object({
      email: z
        .string({ required_error: "Email is required" })
        .email("Invalid email address"),
      password: z.string({ required_error: "Password is required" }),
    }),
  })
);

export default updateEmailSchemaValidation;
