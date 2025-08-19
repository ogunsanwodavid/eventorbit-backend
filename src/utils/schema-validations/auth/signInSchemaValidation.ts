import { z } from "zod";

import validateSchema from "../validateSchema";

const signInSchemaValidation = validateSchema(
  z.object({
    body: z.object({
      email: z
        .string({ required_error: "Email is required" })
        .email("Invalid email address"),
      password: z.string({ required_error: "Password is required" }),
      latitude: z.number().min(-90).max(90).optional(),
      longitude: z.number().min(-180).max(180).optional(),
      pageRedirect: z
        .string({ required_error: "Page redirect is required" })
        .optional(),
    }),
  })
);

export default signInSchemaValidation;
