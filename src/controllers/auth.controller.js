import * as authService from "../services/auth.service.js";
import { success, error as sendError } from "../utils/response.js";


export const register = async (req, res) => {
  try {
    const result = await authService.registerUser(req.body);
    return success(res, result, "User registered", 201);
  } catch (err) {
    // map structured error if available
    const status = err.status || 500;
    const message = err.message || "Internal server error";
    // optional details: err.details
    return sendError(res, message, status);
  }
};

export const login = async (req, res) => {
  try {
    const result = await authService.loginUser(req.body);
    res.cookie('JWT',result.token,{
      expires: new Date(Date.now() + 3600000), 
    httpOnly: true, 
    secure: true 
    })
    return success(res, {user:result.user}, "Logged in", 200);
  } catch (err) {
    const status = err.status || 500;
    const message = err.message || "Internal server error";
    return sendError(res, message, status);
  }
};

export const me = async (req, res) => {
  try {
    const userId = req.user?.id;
    const user = await authService.getUserProfile(userId);
    return success(res, user, "Profile fetched", 200);
  } catch (err) {
    const status = err.status || 500;
    const message = err.message || "Internal server error";
    return sendError(res, message, status);
  }
};

export const updateMe = async (req, res) => {
  try {
    const userId = req.user?.id;
    const updated = await authService.updateUserProfile(userId, req.body);
    return success(res, updated, "Profile updated", 200);
  } catch (err) {
    const status = err.status || 500;
    const message = err.message || "Internal server error";
    return sendError(res, message, status);
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = parseInt(req.user?.id);
    if(!userId) return sendError(res,"Invalid User ID",400)
    const result = await authService.changeUserPassword(userId, req.body);
    return success(res, result, "Password changed", 200);
  } catch (err) {
    const status = err.status || 500;
    const message = err.message || "Internal server error";
    return sendError(res, message, status);
  }
};
