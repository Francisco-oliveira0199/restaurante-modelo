import { carrinho } from "../../js/main.js";
import { atualizarBadge } from "../../js/ui/badge.js";
import { mostrarToast, animarCarrinho } from "../../js/ui/feedback.js";

async function atualizarUIcarrinho() {
  try {
    const mod = await import("../../js/ui/atualizarCarrinhoUI.js");
    if (mod && typeof mod.atualizarCarrinhoUI === "function") {
      mod.atualizarCarrinhoUI();
    }
  } catch (e) {
    console.warn("Falha ao atualizar UI do carrinho:", e);
  }
}

/**
 * Aumenta a quantidade de um item no carrinho
 * @param {number} index - Índice do item no carrinho
 */
export function aumentar(index) {
  try {
    const itens = carrinho.getItens();
    if (!Array.isArray(itens) || index < 0 || index >= itens.length) {
      console.warn("Índice inválido ao aumentar item:", index);
      return;
    }

    carrinho.aumentar(index);

    atualizarBadge();
    atualizarUIcarrinho();
    animarCarrinho();
  } catch (err) {
    console.error("Erro ao aumentar item do carrinho:", err);
    mostrarToast("Erro ao atualizar quantidade", "erro");
  }
}

/**
 * Diminui a quantidade de um item no carrinho
 * @param {number} index - Índice do item no carrinho
 */
export function diminuir(index) {
  try {
    const itens = carrinho.getItens();
    if (!Array.isArray(itens) || index < 0 || index >= itens.length) {
      console.warn("Índice inválido ao diminuir item:", index);
      return;
    }

    carrinho.diminuir(index);

    atualizarBadge();
    atualizarUIcarrinho();
  } catch (err) {
    console.error("Erro ao diminuir item do carrinho:", err);
    mostrarToast("Erro ao atualizar quantidade", "erro");
  }
}

/**
 * Remove um item do carrinho
 * @param {number} index - Índice do item no carrinho
 */
export function remover(index) {
  try {
    const itens = carrinho.getItens();
    if (!Array.isArray(itens) || index < 0 || index >= itens.length) {
      console.warn("Índice inválido ao remover item:", index);
      return;
    }

    carrinho.remover(index);

    atualizarBadge();
    atualizarUIcarrinho();
    mostrarToast("Item removido do carrinho");
  } catch (err) {
    console.error("Erro ao remover item do carrinho:", err);
    mostrarToast("Erro ao remover item", "erro");
  }
}

export function limparCarrinho() {
  try {
    carrinho.limpar();
    atualizarBadge();
    atualizarUIcarrinho();
    mostrarToast("Carrinho limpo");
  } catch (err) {
    console.error("Erro ao limpar carrinho:", err);
    mostrarToast("Erro ao limpar carrinho", "erro");
  }
}

/**
 * Retorna o total do carrinho
 * @returns {number} Total em reais
 */
export function obterTotal() {
  try {
    return carrinho.getTotal();
  } catch (err) {
    console.error("Erro ao obter total do carrinho:", err);
    return 0;
  }
}

/**
 * Retorna os itens do carrinho
 * @returns {Array} Array de itens
 */
export function obterItens() {
  try {
    return carrinho.getItens();
  } catch (err) {
    console.error("Erro ao obter itens do carrinho:", err);
    return [];
  }
}

/**
 * Adiciona um item ao carrinho (wrapper)
 * @param {object} item - Item a adicionar
 */
export function adicionarItem(item) {
  try {
    carrinho.adicionar(item);
    atualizarBadge();
    atualizarUIcarrinho();
    mostrarToast(`"${item.nome}" adicionado ao carrinho`);
    animarCarrinho();
  } catch (err) {
    console.error("Erro ao adicionar item ao carrinho:", err);
    mostrarToast("Erro ao adicionar item", "erro");
  }
}

window.aumentar = aumentar;
window.diminuir = diminuir;
window.remover = remover;
window.limparCarrinho = limparCarrinho;
window.obterTotal = obterTotal;
window.obterItens = obterItens;
window.adicionarItem = adicionarItem;

export default {
  aumentar,
  diminuir,
  remover,
  limparCarrinho,
  obterTotal,
  obterItens,
  adicionarItem
};