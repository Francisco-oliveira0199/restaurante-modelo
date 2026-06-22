import { carrinho } from "../main.js";
import { atualizarBadge } from "../ui/badge.js";
import { mostrarToast, animarCarrinho } from "../ui/feedback.js";

async function atualizarUIcarrinho() {
  try {
    const mod = await import("../ui/atualizarCarrinhoUI.js");
    if (mod && typeof mod.atualizarCarrinhoUI === "function") {
      mod.atualizarCarrinhoUI();
    }
  } catch (e) {
    
    console.warn("Falha ao atualizar UI do carrinho:", e);
  }
}

export function aumentar(index) {
  try {
    const itens = carrinho.getItens();
    if (!Array.isArray(itens) || index < 0 || index >= itens.length) return;

    carrinho.aumentar(index);

    atualizarBadge();
    atualizarUIcarrinho();
    animarCarrinho();
  } catch (err) {
    console.error("Erro ao aumentar item do carrinho:", err);
    mostrarToast("Erro ao atualizar quantidade", "erro");
  }
}

export function diminuir(index) {
  try {
    const itens = carrinho.getItens();
    if (!Array.isArray(itens) || index < 0 || index >= itens.length) return;

    carrinho.diminuir(index);

    atualizarBadge();
    atualizarUIcarrinho();
  } catch (err) {
    console.error("Erro ao diminuir item do carrinho:", err);
    mostrarToast("Erro ao atualizar quantidade", "erro");
  }
}

export function remover(index) {
  try {
    const itens = carrinho.getItens();
    if (!Array.isArray(itens) || index < 0 || index >= itens.length) return;

    carrinho.remover(index);

    atualizarBadge();
    atualizarUIcarrinho();
    mostrarToast("Item removido do carrinho");
  } catch (err) {
    console.error("Erro ao remover item do carrinho:", err);
    mostrarToast("Erro ao remover item", "erro");
  }
}

window.aumentar = aumentar;
window.diminuir = diminuir;
window.remover = remover;

export default {
  aumentar,
  diminuir,
  remover
};