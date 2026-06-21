import express from "express";

import {
  criarPix
}
from "../controllers/pagamentoController.js";

const router =
  express.Router();

router.post(
  "/pix",
  criarPix
);

export default router;