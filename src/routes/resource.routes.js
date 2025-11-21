import express from "express";
import * as resourceController from "../controllers/resource.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", auth, resourceController.getResources);         
router.get("/:id", auth, resourceController.getResourceById);  
router.post("/", auth, resourceController.createResource);     
router.put("/:id", auth, resourceController.updateResource);   
router.patch("/:id", auth, resourceController.updateResource); 
router.delete("/:id", auth, resourceController.deleteResource);

export default router;
