import express from "express";
import * as foodCtrl from "../controllers/fooditem.controller.js";
import auth from '../middlewares/auth.middleware.js'


const router = express.Router();

router.get("/", auth,foodCtrl.getFoodItems);
router.get("/:id", auth, foodCtrl.getFoodItemById);
router.post("/", auth,foodCtrl.createFoodItem); 
router.put("/:id",auth, foodCtrl.updateFoodItem);
router.delete("/:id",auth, foodCtrl.removeFoodItem);

export default router;
