import { z } from "zod";

import validateSchema from "../validateSchema";

const updateProfileSocialUrlsSchemaValidation = validateSchema(
  z.object({
    body: z.object({
      website: z
        .string()
        .url("Website link must be a valid URL")
        .refine((url) => url.startsWith("https://"), {
          message: "Website link must be an HTTPS URL",
        })
        .optional(),
      facebook: z
        .string()
        .url("Facebook link must be a valid URL")
        .refine(
          (url) =>
            url.startsWith("https://facebook.com") ||
            url.startsWith("https://www.facebook.com"),
          {
            message: "Link must be a valid Facebook URL",
          }
        )
        .optional(),
      x: z
        .string()
        .url("X link must be a valid URL")
        .refine(
          (url) =>
            url.startsWith("https://x.com") ||
            url.startsWith("https://www.x.com") ||
            url.startsWith("https://twitter.com") ||
            url.startsWith("https://www.twitter.com"),
          {
            message: "Link must be a valid X / Twitter link",
          }
        )
        .optional(),
      instagram: z
        .string()
        .url("Facebook link must be a valid URL")
        .refine(
          (url) =>
            url.startsWith("https://instagram.com") ||
            url.startsWith("https://www.instagram.com"),
          {
            message: "Link must be a valid Instagram link",
          }
        )
        .optional(),
    }),
  })
);

export default updateProfileSocialUrlsSchemaValidation;
