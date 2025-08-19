import { Router } from "express";
import { getSubmission } from "../controllers/submissionController.js";
import { auth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { submissionIdParamSchema } from "../validations/exam.schemas.js";

const router = Router();

router.get("/:id", auth, validate(submissionIdParamSchema), getSubmission);

export default router;
