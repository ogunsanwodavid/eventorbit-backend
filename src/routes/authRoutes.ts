import { Router } from "express";

import registerUser from "../controllers/auth/registerUser";

import { registerUserValidationSchema } from "../utils/schema-validations/registerUserSchemaValidation";

const router = Router();

//Register new user
router.post("/signup", registerUserValidationSchema, registerUser);

export default router;
