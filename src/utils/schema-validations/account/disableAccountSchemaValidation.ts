import { z } from "zod";

import validateSchema from "../validateSchema";

const disableAccountSchemaValidation = validateSchema(
  z.object({
    body: z.object({
      password: z.string({ required_error: "Password is required" }),
    }),
  })
);

export default disableAccountSchemaValidation;
