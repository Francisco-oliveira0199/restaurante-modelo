import express from "express";

import {
  perfil,
  meusPedidos,
  cancelarPedido
}
from "../controllers/usuarioController.js";

import {
  authMiddleware
}
from "../middleware/authMiddleware.js";

const router =
  express.Router();

router.get(
  "/perfil",
  authMiddleware,
  perfil
);

router.get(
  "/pedidos",
  authMiddleware,
  meusPedidos
);

router.put(
  "/pedido/:id/cancelar",
  authMiddleware,
  cancelarPedido
);

export default router;