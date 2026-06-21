import { carrinho } from "../main.js";

export function atualizarBadge() {
  const badge = document.getElementById("badgeCarrinho");
  if (!badge) return;

  const total = carrinho.getItens().reduce((a, i) => a + i.quantidade, 0);

  badge.innerText = String(total);
  badge.style.display = total ? "block" : "none";
}