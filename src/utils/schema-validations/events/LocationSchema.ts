import { z } from "zod";

const LocationSchema = z
  .object({
    isVirtual: z.coerce.boolean(),
    address: z.string().optional(),
    venueName: z.string().optional(),
    organizerAddress: z.string().optional(),
    connectionDetails: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.isVirtual) {
      if (!data.address) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Address is required for physical events",
          path: ["address"],
        });
      }
      if (!data.venueName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Venue name is required for physical events",
          path: ["venueName"],
        });
      }
    } else {
      if (!data.organizerAddress) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Organizer address is required for virtual events",
          path: ["organizerAddress"],
        });
      }
      if (!data.connectionDetails) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Connection details are required for virtual events",
          path: ["connectionDetails"],
        });
      }
    }
  });

export default LocationSchema;
