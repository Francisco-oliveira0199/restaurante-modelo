import express from "express";

import {
  criarCupom,
  listarCupons,
  validarCupom,
  atualizarCupom,
  removerCupom
}
from "../controllers/cupomController.js";

import {
  authMiddleware
}
from "../middleware/authMiddleware.js";

import {
  adminMiddleware
}
from "../middleware/adminMiddleware.js";

const router =
  express.Router();

router.post(
  "/validar",
  validarCupom
);

router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  listarCupons
);

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  criarCupom
);

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  atualizarCupom
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  removerCupom
);

export default router;