import { z } from "zod";

import validateSchema from "../validateSchema";

const updateLocationSchemaValidation = validateSchema(
  z.object({
    body: z.object({
      location: z.string({ required_error: "Location is required" }),
    }),
  })
);

export default updateLocationSchemaValidation;
