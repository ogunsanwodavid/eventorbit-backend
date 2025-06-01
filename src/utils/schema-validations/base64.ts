import { z } from "zod";

// Universal Base64 string validator
export const base64Schema = z.string().refine(
  (val) => {
    // Basic Base64 pattern (supports optional data: prefix)
    const regex =
      /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/;
    const pureBase64 = val.replace(/^data:[^;]+;base64,/, "");
    return regex.test(pureBase64);
  },
  {
    message: "Invalid Base64 string",
  }
);

// Base64 image validator (specific to your use case)
export const base64ImageSchema = base64Schema
  .refine(
    (val) => {
      return val.startsWith("data:image/");
    },
    {
      message: "Must be a Base64-encoded image",
    }
  )
  .refine(
    (val) => {
      const base64Data = val.split(",")[1];
      const sizeInBytes = (base64Data.length * 3) / 4; // Approximate size
      return sizeInBytes <= 5 * 1024 * 1024; // 5MB limit
    },
    {
      message: "Image must be under 5MB",
    }
  );
