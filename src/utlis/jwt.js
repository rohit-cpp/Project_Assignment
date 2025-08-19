import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signToken(sub) {
  return jwt.sign({ sub }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}
