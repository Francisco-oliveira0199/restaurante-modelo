import { carrinho } from "../main.js";
import { formatarPreco } from "../utils/helpers.js";
import { aumentar, diminuir, remover } from "../controllers/carrinhoController.js";
import { modalState } from "../state/modalState.js";

/**
 * Abre a configuração de um item do carrinho para edição
 * @param {string} nome - Nome do produto
 * @param {number} preco - Preço do produto
 * @param {string} sabor - Sabor do produto
 */
async function openConfig(nome, preco, sabor) {
  try {
  
    if (typeof window !== "undefined" && typeof window.abrirConfig === "function") {
      window.abrirConfig(nome, preco, sabor);
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

/**
 * Formata extras para exibição
 * @param {Array} extras - Array de extras
 * @returns {string} String formatada com extras
 */
function formatarExtras(extras) {
  if (!extras || extras.length === 0) return "";

  const extrasFormatados = {
    bacon: "Bacon",
    ovo: "Ovo",
    cebola: "Cebola",
    presunto: "Presunto",
    frango: "Frango",
    queijo: "Queijo"
  };

  return extras
    .map((e) => extrasFormatados[e] || e)
    .join(", ");
}

/**
 * Constrói HTML de extras para exibição no carrinho
 * @param {object} item - Item do carrinho
 * @returns {string} HTML com informações dos extras
 */
function construirHTMLExtras(item) {
  let extrasHTML = "";

  if (item.sabor1) {
    extrasHTML += `<p><strong>Sabor:</strong> ${String(item.sabor1)}</p>`;
  }

  if (item.meioMeio && item.sabor2) {
    extrasHTML += `<p><strong>Meio a meio:</strong> ${String(item.sabor1)} / ${String(item.sabor2)}</p>`;
  }

  if (item.borda) {
    const bordaFormatada = item.borda.charAt(0).toUpperCase() + item.borda.slice(1);
    extrasHTML += `<p><strong>Borda:</strong> ${bordaFormatada}</p>`;
  }

  if (item.bebida) {
    extrasHTML += `<p><strong>Bebida:</strong> ${String(item.bebida)}</p>`;
  }

  if (item.ponto) {
    extrasHTML += `<p><strong>Ponto:</strong> ${String(item.ponto)}</p>`;
  }

  if (item.massa) {
    extrasHTML += `<p><strong>Massa:</strong> ${String(item.massa)}</p>`;
  }

  if (item.extras && item.extras.length > 0) {
    const extrasFormatados = formatarExtras(item.extras);
    extrasHTML += `<p><strong>Extras:</strong> ${extrasFormatados}</p>`;
  }

  if (item.observacoes) {
    extrasHTML += `<p><strong>Obs:</strong> ${String(item.observacoes)}</p>`;
  }

  return extrasHTML;
}

function atualizarCarrinhoUI() {
  const container = document.getElementById("carrinhoLista");
  const totalEl = document.getElementById("totalCarrinho");

  if (!container || !totalEl) {
    console.warn("Elementos do carrinho não encontrados no DOM");
    return;
  }

  const itens = carrinho.getItens();

  if (itens.length === 0) {
    container.innerHTML = "<p>Seu carrinho está vazio</p>";
    totalEl.innerText = "R$ 0,00";
    return;
  }

  let html = "";
  let total = 0;

  itens.forEach((item, index) => {
    const subtotal = item.total || 0;
    total += subtotal;

    const extrasHTML = construirHTMLExtras(item);

    html += `
      <div class="carrinho-item">
        <div class="info">
          <strong>${String(item.nome)}</strong>
          <p class="item-preco">${formatarPreco(subtotal)}</p>
          ${extrasHTML}
        </div>

        <div class="acoes">
          <div class="acoes-topo">
            <div class="qtd">
              <button data-action="diminuir" data-index="${index}" aria-label="Diminuir quantidade">−</button>
              <span>${item.quantidade}</span>
              <button data-action="aumentar" data-index="${index}" aria-label="Aumentar quantidade">+</button>
            </div>

            <button class="remover" data-action="remover" data-index="${index}" aria-label="Remover item">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>

          <button class="btn-comprar-item" data-action="comprar-item" data-index="${index}">
            Editar
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  totalEl.innerText = formatarPreco(total);

  container.querySelectorAll("button[data-action]").forEach((btn) => {
    const action = btn.dataset.action;
    const idx = Number(btn.dataset.index);

    if (Number.isNaN(idx)) {
      console.warn("Índice inválido para botão:", btn);
      return;
    }

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      switch (action) {
        case "aumentar":
          aumentar(idx);
          break;
        case "diminuir":
          diminuir(idx);
          break;
        case "remover":
          remover(idx);
          break;
        case "comprar-item":
          comprarItem(idx);
          break;
        default:
          console.warn("Ação desconhecida:", action);
      }
    });
  });
}

/**
 * Abre o item do carrinho em modo de edição
 * @param {number} index - Índice do item
 */
function comprarItem(index) {
  const itens = carrinho.getItens();

  if (!itens || index < 0 || index >= itens.length) {
    console.warn("Índice inválido para compra de item:", index);
    return;
  }

  const item = itens[index];

  if (!item) {
    console.warn("Item não encontrado no índice:", index);
    return;
  }

  modalState.comprandoDoCarrinho = true;

  modalState.item = modalState.item || {};
  modalState.item.nome = item.nome;
  modalState.item.sabor = item.sabor1 || null;

  modalState.precoBase = item.precoUnitario || 0;

  modalState.config = {
    quantidade: item.quantidade || 1,
    sabor1: item.sabor1 || null,
    sabor2: item.sabor2 || null,
    meioMeio: item.meioMeio || false,
    borda: item.borda || null,
    bebida: item.bebida || null,
    ponto: item.ponto || null,
    massa: item.massa || null,
    extras: item.extras || [],
    observacoes: item.observacoes || ""
  };

  modalState.checkoutItens = [item];

  openConfig(item.nome, modalState.precoBase, item.sabor1);
}

window.atualizarCarrinhoUI = atualizarCarrinhoUI;
window.comprarItem = comprarItem;

export { atualizarCarrinhoUI };