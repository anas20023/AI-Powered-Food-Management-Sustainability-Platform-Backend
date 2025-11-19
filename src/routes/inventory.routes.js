import express from "express";
import * as inventoryController from "../controllers/inventory.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", auth, inventoryController.getInventory);
router.post("/", auth, inventoryController.createInventoryItem);
router.put("/:id", auth, inventoryController.updateInventoryItem);
router.delete("/:id", auth, inventoryController.deleteInventoryItem);

export default router;
