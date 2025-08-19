import { Router } from "express";
import { register, login, me, logout } from "../controllers/authController.js";
import { registerSchema, loginSchema } from "../validations/auth.schemas.js";
import { auth } from "../middlewares/auth.js";
import rateLimit from "express-rate-limit";
import { validate } from "../middlewares/validate.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.get("/me", auth, me);
router.post("/logout", auth, logout);

export default router;
