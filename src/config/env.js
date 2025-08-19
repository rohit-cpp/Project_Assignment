import dotenv from "dotenv";
dotenv.config();

export const env = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  cookieSecure: String(process.env.COOKIE_SECURE) === "true",
  nodeEnv: process.env.NODE_ENV || "development",
};

if (!env.mongoUri) {
  console.error("MONGO_URI is required");
  process.exit(1);
}
if (!env.jwtSecret) {
  console.error("JWT_SECRET is required");
  process.exit(1);
}
