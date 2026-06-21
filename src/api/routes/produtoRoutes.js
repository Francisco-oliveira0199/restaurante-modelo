import express from "express";

import {

criarProduto,
listarProdutos,
listarPromocoes,
buscarProduto,
atualizarProduto,
removerProduto

}
from "../controllers/produtoController.js";

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

router.get(
"/",
listarProdutos
);

router.get(
"/promocoes",
listarPromocoes
);

router.get(
"/:id",
buscarProduto
);

router.post(
"/",
authMiddleware,
adminMiddleware,
criarProduto
);

router.put(
"/:id",
authMiddleware,
adminMiddleware,
atualizarProduto
);

router.delete(
"/:id",
authMiddleware,
adminMiddleware,
removerProduto
);

export default router;
