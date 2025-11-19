import express from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import foodRoutes from "./food.routes.js";
import inventoryRoutes from "./inventory.routes.js";
import logsRoutes from "./logs.routes.js";
import resourceRoutes from "./resource.routes.js";
import uploadRoutes from "./uploads.routes.js";


const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/food-items", foodRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/logs", logsRoutes);
router.use("/resources", resourceRoutes);
router.use("/uploads", uploadRoutes);


export default router;
