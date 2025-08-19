import { verifyToken } from "../utlis/jwt.js";

export function auth(req, res, next) {
  try {
    const bearer = req.headers.authorization;
    const headerToken =
      bearer && bearer.startsWith("Bearer ") ? bearer.split(" ")[1] : null;
    const cookieToken = req.cookies?.token;
    const token = cookieToken || headerToken;
    if (!token)
      return res.status(401).json({ error: { message: "Unauthorized" } });
    const decoded = verifyToken(token);
    req.userId = decoded.sub;
    next();
  } catch (e) {
    return res.status(401).json({ error: { message: "Invalid token" } });
  }
}
