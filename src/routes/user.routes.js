import express from "express";
import * as userControllers from "../controllers/user.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", auth, userControllers.getAllUsers);
router.get("/:id", auth, userControllers.getUserById);

export default router;
