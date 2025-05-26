import { z } from "zod";

import validateSchema from "../validateSchema";

const updatePoliciesSchemaValidation = validateSchema(
  z.object({
    body: z.object({
      termsAndConditions: z
        .string({ required_error: "Email is required" })
        .url("Terms & Conditions must be a valid URL")
        .refine((url) => url.startsWith("https://"), {
          message: "Terms & Conditions must be an HTTPS URL",
        }),
      privacyPolicy: z
        .string({ required_error: "Password is required" })
        .url("Privacy Policy must be a valid URL")
        .refine((url) => url.startsWith("https://"), {
          message: "Privacy Policy must be an HTTPS URL",
        }),
    }),
  })
);

export default updatePoliciesSchemaValidation;
