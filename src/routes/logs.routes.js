import express from "express";
import * as logsController from "../controllers/logs.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = express.Router();

// router.get("/", auth, getLogs);
// router.post("/", auth, createLog);
// router.delete("/:id", auth, deleteLog);

export default router;
