import express from "express";
import * as userControllers from "../controllers/user.controller.js";
// import auth from "../middlewares/auth.middleware.js";

const router = express.Router();

// router.get("/", auth, getAllUsers);
// router.get("/:id", auth, getUserById);

export default router;
