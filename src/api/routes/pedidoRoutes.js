import express from "express";

import {
  criarPedido,
  listarPedidos,
  buscarPedido,
  atualizarStatus,
  listarMeusPedidos,
  buscarMeuPedidoStatus
} from "../controllers/pedidoController.js";

import {
  authMiddleware
} from "../middleware/authMiddleware.js";

import {
  adminMiddleware
} from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  criarPedido
);

router.get(
  "/me",
  authMiddleware,
  listarMeusPedidos
);

router.get(
  "/me/:id/status",
  authMiddleware,
  buscarMeuPedidoStatus
);

router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  listarPedidos
);

router.get(
  "/:id",
  authMiddleware,
  buscarPedido
);

router.put(
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  atualizarStatus
);

export default router;