import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { signToken } from "../utlis/jwt.js";
import { env } from "../config/env.js";

export async function register(req, res) {
  const { name, email, password } = req.validated.body;
  const existing = await User.findOne({ email });
  if (existing)
    return res.status(400).json({ error: { message: "Email already in use" } });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });
  res.status(201).json({
    message: "Registered",
    user: { id: user._id, name: user.name, email: user.email },
  });
}

export async function login(req, res) {
  const { email, password } = req.validated.body;
  const user = await User.findOne({ email });
  if (!user)
    return res.status(400).json({ error: { message: "Invalid credentials" } });
  const ok = await user.comparePassword(password);
  if (!ok)
    return res.status(400).json({ error: { message: "Invalid credentials" } });
  const token = signToken(user._id.toString());
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: env.cookieSecure,
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.json({
    message: "Logged in",
    user: { id: user._id, name: user.name, email: user.email },
  });
}

export async function me(req, res) {
  const user = await User.findById(req.userId).select("_id name email");
  res.json({ user });
}

export async function logout(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict",
    secure: env.cookieSecure,
  });
  res.json({ message: "Logged out" });
}
