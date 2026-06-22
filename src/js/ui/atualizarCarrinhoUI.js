import { carrinho } from "../main.js";
import { formatarPreco } from "../utils/helpers.js";
import {
  aumentar,
  diminuir,
  remover
} from "../controllers/carrinhoController.js";

import { modalState } from "../state/modalState.js";

async function openConfig(nome, preco, sabor) {
  try {
    if (typeof window !== "undefined" && typeof window.openModal === "function") {
      window.openModal(nome, preco, sabor);
      return;
    }

    const mod = await import("../controllers/modalController.js");
    if (mod && typeof mod.abrirConfig === "function") {
      mod.abrirConfig(nome, preco, sabor);
      return;
    }
    if (mod && mod.default && typeof mod.default.abrirConfig === "function") {
      mod.default.abrirConfig(nome, preco, sabor);
      return;
    }
  } catch (e) {
    console.warn("openConfig: não foi possível abrir modal dinamicamente", e);
  }

  console.warn("openConfig: nenhuma implementação de modal disponível");
}

function atualizarCarrinhoUI() {
  const container = document.getElementById("carrinhoLista");
  const totalEl = document.getElementById("totalCarrinho");

  if (!container || !totalEl) return;

  if (carrinho.getItens().length === 0) {
    container.innerHTML = "<p>Seu carrinho está vazio</p>";
    totalEl.innerText = "R$ 0,00";
    return;
  }

  let html = "";

  container.innerHTML = "";

  let total = 0;

  carrinho.getItens().forEach((item, index) => {
    const precoBase = item.precoUnitario || item.preco;
    const subtotal = item.total;
    total += subtotal;
    let extrasHTML = "";

    if (item.meioMeio) {
      extrasHTML += `<p>Meio a meio: ${String(item.sabor1)} / ${String(item.sabor2)}</p>`;
    }

    if (item.borda) {
      extrasHTML += `<p>Borda: ${String(item.borda)}</p>`;
    }

    if (item.bebida) {
      extrasHTML += `<p>Bebida: ${String(item.bebida)}</p>`;
    }

    if (item.ponto) {
      extrasHTML += `<p>Ponto: ${String(item.ponto)}</p>`;
    }

    if (item.massa) {
      extrasHTML += `<p>Massa: ${String(item.massa)}</p>`;
    }

    if (item.extras?.length) {
      extrasHTML += `<p>Extras: ${item.extras.map(e => String(e)).join(", ")}</p>`;
    }

    html += `
      <div class="carrinho-item">

        <div class="info">
          <strong>${String(item.nome)}</strong>
          <p>R$ ${subtotal.toFixed(2).replace(".", ",")}</p>
          ${extrasHTML}
        </div>

        <div class="acoes">

  <div class="acoes-topo">

    <div class="qtd">
      <button data-action="diminuir" data-index="${index}">-</button>

      <span>${item.quantidade}</span>

      <button data-action="aumentar" data-index="${index}">+</button>
    </div>

    <button class="remover" data-action="remover" data-index="${index}">
      <i class="fa-solid fa-trash"></i>
    </button>

  </div>

  <button class="btn-comprar-item" data-action="comprar-item" data-index="${index}">
    Comprar
  </button>

  </div>

      </div>
    `;
  });

  container.innerHTML = html;

  totalEl.innerText = `R$ ${total.toFixed(2).replace(".", ",")}`;

  container.querySelectorAll("button[data-action]").forEach(btn => {
    const action = btn.dataset.action;
    const idx = Number(btn.dataset.index);
    if (action === "aumentar") {
      btn.addEventListener("click", () => aumentar(idx));
    } else if (action === "diminuir") {
      btn.addEventListener("click", () => diminuir(idx));
    } else if (action === "remover") {
      btn.addEventListener("click", () => remover(idx));
    } else if (action === "comprar-item") {
      btn.addEventListener("click", () => comprarItem(idx));
    }
  });
}

export { atualizarCarrinhoUI };

function comprarItem(index) {
  const item = carrinho.getItens()[index];

  if (!item) return;

  modalState.comprandoDoCarrinho = true;

  modalState.item = modalState.item || {};
  modalState.item.nome = item.nome;

  modalState.precoBase = item.precoUnitario;

  modalState.config = {
    quantidade: item.quantidade,
    sabor1: item.sabor1 || null,
    sabor2: item.sabor2 || null,
    meioMeio: item.meioMeio || false,
    borda: item.borda || null,
    bebida: item.bebida || null,
    ponto: item.ponto || null,
    massa: item.massa || null,
    extras: item.extras || []
  };

  modalState.checkoutItens = [item];

  openConfig(item.nome, modalState.precoBase, item.sabor1);
}

window.aumentar = aumentar;
window.diminuir = diminuir;
window.remover = remover;
window.comprarItem = comprarItem;