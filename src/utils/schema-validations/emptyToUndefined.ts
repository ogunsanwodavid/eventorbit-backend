import { z } from "zod";

//Helper: turn "" or [] into undefined
const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((val) => {
    if (val === "" || (Array.isArray(val) && val.length === 0)) {
      return undefined;
    }
    return val;
  }, schema.optional());

export default emptyToUndefined;
