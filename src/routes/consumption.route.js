import express from "express";
import * as consumeController from '../controllers/consume.controller.js'
import auth from '../middlewares/auth.middleware.js'
const router = express.Router();

router.get('/',auth, consumeController.getconsumption)
router.get('/waste',auth,consumeController.getwaste)

export default router;