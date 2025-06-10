import { z } from "zod";

const DateStringSchema = z.string().refine(
  (val) => {
    return !isNaN(Date.parse(val));
  },
  {
    message: "Invalid date string format",
  }
);

export default DateStringSchema;
