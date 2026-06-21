import express from "express";

import {
  listarEnderecos,
  criarEndereco,
  atualizarEndereco,
  excluirEndereco
} from "../controllers/enderecoController.js";

import {
  authMiddleware
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  listarEnderecos
);

router.post(
  "/",
  authMiddleware,
  criarEndereco
);

router.put(
  "/:id",
  authMiddleware,
  atualizarEndereco
);

router.delete(
  "/:id",
  authMiddleware,
  excluirEndereco
);

export default router;