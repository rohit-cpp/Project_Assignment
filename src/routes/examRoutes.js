import { Router } from "express";
import { startExam, submitExam } from "../controllers/examController.js";
import { auth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  startExamSchema,
  submitExamSchema,
} from "../validations/exam.schemas.js";

const router = Router();

router.post("/start", auth, validate(startExamSchema), startExam);
router.post("/submit", auth, validate(submitExamSchema), submitExam);

export default router;
