import { z } from "zod";

import validateSchema from "../validateSchema";

const registerUserValidationSchema = validateSchema(
  z
    .object({
      body: z.object({
        userType: z.enum(["individual", "organization"], {
          required_error: "User type is required",
          invalid_type_error:
            'User type must be "individual" or "organization"',
        }),
        firstName: z
          .string({ required_error: "First name is required for individuals" })
          .min(1, "First name cannot be empty")
          .optional(),
        lastName: z
          .string({ required_error: "Last name is required for individuals" })
          .min(1, "Last name cannot be empty")
          .optional(),
        organizationName: z
          .string({
            required_error: "Organization name is required for organizations",
          })
          .min(1, "Organization name cannot be empty")
          .optional(),
        email: z
          .string({ required_error: "Email is required" })
          .email("Invalid email address"),
        password: z
          .string({ required_error: "Password is required" })
          .min(6, "Password must be at least 6 characters"),
        latitude: z.number().min(-90).max(90).optional(),
        longitude: z.number().min(-180).max(180).optional(),
        pageRedirect: z
          .string({ required_error: "Page redirect is required" })
          .optional(),
      }),
    })
    .superRefine((data, ctx) => {
      const body = data.body;

      if (body.userType === "individual") {
        if (!body.firstName) {
          ctx.addIssue({
            code: "custom",
            message: "First name is required for individuals",
            path: ["body", "firstName"],
          });
        }
        if (!body.lastName) {
          ctx.addIssue({
            code: "custom",
            message: "Last name is required for individuals",
            path: ["body", "lastName"],
          });
        }
      } else if (body.userType === "organization") {
        if (!body.organizationName) {
          ctx.addIssue({
            code: "custom",
            message: "Organization name is required for organizations",
            path: ["body", "organizationName"],
          });
        }
      }
    })
);

export default registerUserValidationSchema;
