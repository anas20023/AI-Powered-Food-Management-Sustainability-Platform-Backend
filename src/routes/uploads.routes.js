import express from "express";

import * as uploadsCtrl from "../controllers/uploads.controller.js";
import auth from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/", auth,uploadsCtrl.uploadFile);
router.get("/:id", auth, uploadsCtrl.getUploadById);
router.delete("/:id", auth, uploadsCtrl.deleteUpload);

export default router;
