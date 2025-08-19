import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { connectDB } from "./src/config/db.js";
import { env } from "./src/config/env.js";
import authRoutes from "./src/routes/authRoutes.js";
import examsRoutes from "./src/routes/examRoutes.js";
import submissionsRoutes from "./src/routes/submissionRoutes.js";
import { notFound, errorHandler } from "./src/middlewares/error.js";

async function bootstrap() {
  await connectDB();

  const app = express();

  app.use(helmet());
  app.disable("x-powered-by");

  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    })
  );
  app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.get("/health", (req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRoutes);
  app.use("/api/exams", examsRoutes);
  app.use("/api/submissions", submissionsRoutes);

  app.use(notFound);
  app.use(errorHandler);

  app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
