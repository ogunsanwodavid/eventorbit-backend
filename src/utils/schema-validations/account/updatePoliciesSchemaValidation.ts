import { z } from "zod";

import validateSchema from "../validateSchema";

const updatePoliciesSchemaValidation = validateSchema(
  z.object({
    body: z.object({
      termsAndConditions: z
        .string()
        .url("Terms & Conditions must be a valid URL")
        .refine((url) => url.startsWith("https://"), {
          message: "Terms & Conditions must be an HTTPS URL",
        })
        .optional(),
      privacyPolicy: z
        .string()
        .url("Privacy Policy must be a valid URL")
        .refine((url) => url.startsWith("https://"), {
          message: "Privacy Policy must be an HTTPS URL",
        })
        .optional(),
    }),
  })
);

export default updatePoliciesSchemaValidation;
