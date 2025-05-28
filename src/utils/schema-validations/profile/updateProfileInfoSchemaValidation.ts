import { z } from "zod";

import validateSchema from "../validateSchema";

const updateProfileInfoSchemaValidation = validateSchema(
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
        description: z
          .string({ message: "Description must be a string" })
          .optional(),
        profileSlug: z
          .string({ required_error: "Profile slug is required" })
          .min(1, "Profile slug cannot be empty"),
        isPrivate: z.boolean({ message: "isPrivate must be a boolean" }),
        isABusinessSeller: z.boolean({
          message: "isABusinessSeller must be a boolean",
        }),
        businessAddress: z
          .string({
            required_error: "Business address is required for business sellers",
          })
          .min(1, "Business address cannot be empty")
          .optional(),
        businessEmail: z
          .string({
            required_error: "Business email is required for business sellers",
          })
          .email("Invalid business email address")
          .optional(),
        businessPhoneNumber: z
          .string({
            required_error:
              "Business phone number is required for business sellers",
          })
          .min(1, "Business phone number cannot be empty")
          .optional(),
      }),
    })
    .superRefine((data, ctx) => {
      const {
        userType,
        firstName,
        lastName,
        organizationName,
        isABusinessSeller,
        businessAddress,
        businessEmail,
        businessPhoneNumber,
      } = data.body;

      // Validate userType-specific fields
      if (userType === "individual") {
        if (!firstName) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["body", "firstName"],
            message: "First name is required for individual users",
          });
        }
        if (!lastName) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["body", "lastName"],
            message: "Last name is required for individual users",
          });
        }
      } else if (userType === "organization") {
        if (!organizationName) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["body", "organizationName"],
            message: "Organization name is required for organization users",
          });
        }
      }

      // Validate business seller fields
      if (isABusinessSeller) {
        if (!businessAddress) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["body", "businessAddress"],
            message: "Business address is required for business sellers",
          });
        }
        if (!businessEmail) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["body", "businessEmail"],
            message: "Business email is required for business sellers",
          });
        }
        if (!businessPhoneNumber) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["body", "businessPhoneNumber"],
            message: "Business phone number is required for business sellers",
          });
        }
      }
    })
);

export default updateProfileInfoSchemaValidation;
