import express from "express";

import {
  receberWebhook
} from "../controllers/mercadoPagoWebhookController.js";

const router = express.Router();

router.post(
  "/mercadopago",
  receberWebhook
);

export default router;