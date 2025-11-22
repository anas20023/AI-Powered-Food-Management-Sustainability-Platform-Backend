import jwt from "jsonwebtoken";
import { error } from "../utils/response.js";
import "dotenv/config";

const JWT_SECRET = process.env.JWT_SECRET;

export default function auth(req, res, next) {
  try {
    // const authHeader = req.headers.authorization;

    // if (!authHeader || !authHeader.startsWith("Bearer ")) {
    //   return error(res, "No token provided", 401);
    // }

    const token = req.cookie;

    if (!token) {
      return error(res, "Invalid token", 401);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return error(res, "Invalid or expired token", 401);
    }

    // Attach authenticated user data to req
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    //console.log(req.user);

    return next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    return error(res, "Authentication failed", 500);
  }
}
