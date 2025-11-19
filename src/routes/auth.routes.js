import express from "express";
import * as authController from "../controllers/auth.controller.js";
import auth from "../middlewares/auth.middleware.js"

const router = express.Router();

router.post("/register", authController.register); //done
router.post("/login", authController.login); // done
router.get("/me",auth, authController.me); // done
router.put("/me", auth, authController.updateMe); // done 
router.post("/change-password",auth, authController.changePassword);

export default router;
