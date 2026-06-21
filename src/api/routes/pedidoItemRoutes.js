import express from "express";

import {
  listarItensPedido,
  adicionarItemPedido,
  removerItemPedido
} from "../controllers/pedidoItemController.js";

import {
  authMiddleware
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/pedido/:pedidoId",
  authMiddleware,
  listarItensPedido
);

router.post(
  "/",
  authMiddleware,
  adicionarItemPedido
);

router.delete(
  "/:id",
  authMiddleware,
  removerItemPedido
);

export default router;