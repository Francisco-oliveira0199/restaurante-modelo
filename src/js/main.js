import { Carrinho } from "./models/carrinho.js";
import { atualizarBadge } from "./ui/badge.js";

export const carrinho = new Carrinho();

document.addEventListener("DOMContentLoaded", () => {
  atualizarBadge();
});