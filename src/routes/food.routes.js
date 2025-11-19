import express from "express";
import * as foodCtrl from "../controllers/fooditem.controller.js";

const router = express.Router();

router.get("/", foodCtrl.getFoodItems);
router.get("/:id", foodCtrl.getFoodItemById);
router.post("/", foodCtrl.createFoodItem); // protect with admin auth if needed
router.put("/:id", foodCtrl.updateFoodItem);
router.delete("/:id", foodCtrl.removeFoodItem);
export default router;
