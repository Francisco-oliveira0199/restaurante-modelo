import { carrinho } from "../main.js";
import { atualizarBadge } from "../ui/badge.js";
import { formatarPreco, normalizarItem } from "../utils/helpers.js";
import { mostrarToast, animarCarrinho } from "../ui/feedback.js";
import { modalState, resetState } from "../state/modalState.js";

/**
 * Cria overlay de fundo para o modal
 * @returns {HTMLElement} Elemento overlay
 */
function criarOverlay() {
  let overlay = document.getElementById("modal-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "modal-overlay";
    overlay.className = "modal";
    document.body.appendChild(overlay);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) fecharModais();
    });
  }
  return overlay;
}

/**
 * Fecha todos os modais abertos
 */
function fecharModais() {
  const existing = document.getElementById("modal-root");
  const overlay = document.getElementById("modal-overlay");
  if (existing) existing.remove();
  if (overlay) {
    overlay.classList.remove("active");
    setTimeout(() => {
      if (overlay.parentElement) overlay.remove();
    }, 200);
  }
}

/**
 * Cria um novo elemento modal
 * @param {string} titleHtml - HTML do título
 * @returns {HTMLElement} Elemento modal criado
 */
function criarModal(titleHtml = "") {
  fecharModais();
  const overlay = criarOverlay();
  overlay.classList.add("active");

  const modal = document.createElement("div");
  modal.id = "modal-root";
  modal.className = "modal-box";

  if (titleHtml) {
    const header = document.createElement("div");
    header.className = "modal-topo";
    header.innerHTML = titleHtml;
    modal.appendChild(header);
  }

  overlay.appendChild(modal);
  return modal;
}

/**
 * Calcula o preço unitário com base nos extras selecionados
 * @param {number} precoBase - Preço base do item
 * @param {HTMLElement} modalEl - Elemento do modal
 * @returns {number} Preço unitário calculado
 */
function calcularPrecoUnitario(precoBase, modalEl) {
  let preco = Number(precoBase) || 0;
  if (!modalEl) return preco;

  try {
    modalEl.querySelectorAll("[data-price]").forEach((el) => {
      try {
        const checked = el.type === "checkbox" || el.type === "radio" ? el.checked : true;
        if (!checked) return;
        const p = Number(el.dataset.price || el.dataset.preco || 0);
        if (!Number.isNaN(p)) preco += p;
      } catch (e) {
        console.warn("Erro ao calcular preço de elemento:", e);
      }
    });

    modalEl.querySelectorAll("[data-price-input]").forEach((inp) => {
      try {
        const v = Number(inp.value);
        if (!Number.isNaN(v)) preco += v;
      } catch (e) {
        console.warn("Erro ao calcular preço de input:", e);
      }
    });
  } catch (e) {
    console.warn("Erro ao calcular preço unitário:", e);
  }

  return preco;
}

/**
 * Monta objeto do item a partir dos dados do modal
 * @param {HTMLElement} modalEl - Elemento do modal
 * @returns {object} Objeto com dados do item
 */
function montarItemDoModal(modalEl) {
  const nome = modalState.item?.nome || modalEl.querySelector(".modal-nome")?.innerText || "Item";
  const precoBase = Number(modalState.precoBase || 0);
  const quantidade = Number(modalEl.querySelector(".modal-quantidade")?.value || 1);
  const sabor1 = modalEl.querySelector(".modal-sabor1")?.value || modalState.config?.sabor1 || null;
  const meioMeio = modalEl.querySelector(".modal-meio-meio")
    ? modalEl.querySelector(".modal-meio-meio").checked
    : modalState.config?.meioMeio || false;
  const sabor2 = meioMeio ? modalEl.querySelector(".modal-sabor2")?.value || modalState.config?.sabor2 || null : null;
  const borda = modalEl.querySelector(".modal-borda")?.value || modalState.config?.borda || null;
  const bebida = modalEl.querySelector(".modal-bebida")?.value || modalState.config?.bebida || null;
  const ponto = modalEl.querySelector(".modal-ponto")?.value || modalState.config?.ponto || null;
  const massa = modalEl.querySelector(".modal-massa")?.value || modalState.config?.massa || null;
  const extras = Array.from(modalEl.querySelectorAll(".modal-extra:checked")).map((chk) => chk.value);
  const observacoes = modalEl.querySelector(".modal-observacoes")?.value || modalState.config?.observacoes || "";

  const precoUnitario = calcularPrecoUnitario(precoBase, modalEl);
  const total = precoUnitario * quantidade;

  return {
    nome,
    quantidade,
    precoUnitario,
    total,
    sabor1,
    sabor2,
    meioMeio,
    borda,
    bebida,
    ponto,
    massa,
    extras,
    observacoes
  };
}

/**
 * Atualiza dinamicamente a UI do carrinho
 */
async function atualizarUIcarrinho() {
  try {
    const mod = await import("../ui/atualizarCarrinhoUI.js");
    if (mod && typeof mod.atualizarCarrinhoUI === "function") {
      mod.atualizarCarrinhoUI();
    }
  } catch (e) {
    console.warn("Não foi possível atualizar a UI do carrinho dinamicamente:", e);
  }
}

/**
 * Abre modal de configuração do produto
 * @param {string} nome - Nome do produto
 * @param {number} preco - Preço base do produto
 * @param {string} sabor - Sabor padrão (opcional)
 */
export async function abrirConfig(nome, preco = 0, sabor = null) {
  modalState.item = modalState.item || {};
  modalState.item.nome = nome || modalState.item.nome || "";
  modalState.precoBase = Number(preco || modalState.precoBase || 0);

  if (sabor) {
    modalState.config = modalState.config || {};
    modalState.config.sabor1 = sabor;
  }

  const modal = criarModal(`
    <div class="modal-topo">
      <h2 class="modal-nome">${modalState.item.nome}</h2>
      <p class="preco-topo">${formatarPreco(Number(modalState.precoBase || 0))}</p>
    </div>
  `);

  const scrollDiv = document.createElement("div");
  scrollDiv.className = "modal-scroll";

  const bodyDiv = document.createElement("div");
  bodyDiv.className = "modal-body";

  bodyDiv.innerHTML = `
    <div class="quantidade-box">
      <h3>Quantidade</h3>
      <div class="controle-qtd">
        <button type="button" class="modal-qty-decr">−</button>
        <input type="number" class="modal-quantidade" value="${
          modalState.config?.quantidade || 1
        }" min="1" id="quantidadeValor">
        <button type="button" class="modal-qty-incr">+</button>
      </div>
    </div>

    <div class="secao">
      <h3>Sabor principal</h3>
      <input type="text" class="modal-sabor1" value="${
        modalState.config?.sabor1 || (modalState.item?.sabor || "")
      }" placeholder="Digite o sabor">
    </div>

    <div class="secao">
      <label>
        <input type="checkbox" class="modal-meio-meio" ${
          modalState.config?.meioMeio ? "checked" : ""
        }>
        Meio a meio (segundo sabor)
      </label>
      <div class="modal-sabor2-wrap" style="display: ${
        modalState.config?.meioMeio ? "block" : "none"
      };">
        <input type="text" class="modal-sabor2" value="${
          modalState.config?.sabor2 || ""
        }" placeholder="Digite o segundo sabor">
      </div>
    </div>

    <div class="secao">
      <h3>Borda</h3>
      <label class="radio-option">
        <input type="radio" name="borda" value="" ${
          !modalState.config?.borda ? "checked" : ""
        }>
        <p>Sem borda</p>
      </label>
      <label class="radio-option">
        <input type="radio" name="borda" value="catupiry" data-price="5" ${
          modalState.config?.borda === "catupiry" ? "checked" : ""
        }>
        <p>Catupiry</p>
        <span>+R$5,00</span>
      </label>
      <label class="radio-option">
        <input type="radio" name="borda" value="cheddar" data-price="6" ${
          modalState.config?.borda === "cheddar" ? "checked" : ""
        }>
        <p>Cheddar</p>
        <span>+R$6,00</span>
      </label>
    </div>

    <div class="secao">
      <h3>Extras</h3>
      <label>
        <input type="checkbox" class="modal-extra" value="bacon" data-price="3" />
        Bacon (+R$3)
      </label>
      <label>
        <input type="checkbox" class="modal-extra" value="ovo" data-price="2" />
        Ovo (+R$2)
      </label>
      <label>
        <input type="checkbox" class="modal-extra" value="cebola" data-price="1" />
        Cebola (+R$1)
      </label>
    </div>

    <div class="secao">
      <h3>Observações</h3>
      <textarea class="modal-observacoes" placeholder="Digite observações">${
        modalState.config?.observacoes || ""
      }</textarea>
    </div>

    <div class="resumo-pedido" style="margin-top: 16px; border-radius: 8px;">
      <span>Resumo do pedido</span>
      <h2 style="font-size: 18px;">Total</h2>
      <p class="modal-total">${formatarPreco(
        calcularPrecoUnitario(modalState.precoBase, null) * (modalState.config?.quantidade || 1)
      )}</p>
    </div>
  `;

  scrollDiv.appendChild(bodyDiv);
  modal.appendChild(scrollDiv);

  const footerDiv = document.createElement("div");
  footerDiv.className = "modal-footer";
  footerDiv.innerHTML = `
    <button type="button" class="btn modal-fechar">Fechar</button>
    <button type="button" class="btn modal-adicionar">Adicionar ao carrinho</button>
    <button type="button" class="btn modal-comprar" style="background: linear-gradient(135deg, #2b9f3b, #1e7a2a); margin-top: 8px;">Comprar agora</button>
  `;

  modal.appendChild(footerDiv);

  const btnFechar = modal.querySelector(".modal-fechar");
  const btnAdicionar = modal.querySelector(".modal-adicionar");
  const btnComprar = modal.querySelector(".modal-comprar");
  const inputQty = modal.querySelector(".modal-quantidade");
  const btnIncr = modal.querySelector(".modal-qty-incr");
  const btnDecr = modal.querySelector(".modal-qty-decr");
  const meioChk = modal.querySelector(".modal-meio-meio");
  const sabor2Wrap = modal.querySelector(".modal-sabor2-wrap");
  const totalEl = modal.querySelector(".modal-total");
  const bordaRadios = modal.querySelectorAll('input[name="borda"]');

  function atualizarTotal() {
    // Atualizar seleção de borda
    const bordaSelecionada = modal.querySelector('input[name="borda"]:checked')?.value || "";
    modalState.config.borda = bordaSelecionada || null;

    const unit = calcularPrecoUnitario(modalState.precoBase, modal);
    const qty = Number(inputQty.value || 1);
    totalEl.innerText = formatarPreco(unit * qty);
  }

  btnIncr?.addEventListener("click", () => {
    inputQty.value = Math.max(1, Number(inputQty.value || 1) + 1);
    atualizarTotal();
  });

  btnDecr?.addEventListener("click", () => {
    inputQty.value = Math.max(1, Number(inputQty.value || 1) - 1);
    atualizarTotal();
  });

  inputQty?.addEventListener("input", () => {
    if (Number(inputQty.value) < 1) inputQty.value = 1;
    atualizarTotal();
  });

  meioChk?.addEventListener("change", () => {
    const checked = meioChk.checked;
    sabor2Wrap.style.display = checked ? "block" : "none";
  });

  modal.querySelectorAll("[data-price], [data-price-input]").forEach((el) => {
    el.addEventListener("change", atualizarTotal);
    el.addEventListener("input", atualizarTotal);
  });

  btnFechar?.addEventListener("click", () => fecharModais());

  btnAdicionar?.addEventListener("click", () => {
    const item = montarItemDoModal(modal);
    const normalized = normalizarItem({
      nome: item.nome,
      quantidade: item.quantidade,
      precoUnitario: item.precoUnitario,
      total: item.total,
      sabor1: item.sabor1,
      sabor2: item.sabor2,
      meioMeio: item.meioMeio,
      borda: item.borda,
      bebida: item.bebida,
      ponto: item.ponto,
      massa: item.massa,
      extras: item.extras,
      observacoes: item.observacoes
    });

    carrinho.adicionar(normalized);
    atualizarBadge();
    atualizarUIcarrinho();
    mostrarToast(`${item.nome} adicionado ao carrinho`);
    animarCarrinho();
    fecharModais();
  });

  btnComprar?.addEventListener("click", async () => {
    const item = montarItemDoModal(modal);
    const normalized = normalizarItem({
      nome: item.nome,
      quantidade: item.quantidade,
      precoUnitario: item.precoUnitario,
      total: item.total,
      sabor1: item.sabor1,
      sabor2: item.sabor2,
      meioMeio: item.meioMeio,
      borda: item.borda,
      bebida: item.bebida,
      ponto: item.ponto,
      massa: item.massa,
      extras: item.extras,
      observacoes: item.observacoes
    });

    carrinho.adicionar(normalized);
    atualizarBadge();
    atualizarUIcarrinho();
    mostrarToast(`${item.nome} adicionado ao carrinho`);
    animarCarrinho();
    fecharModais();
    abrirCarrinho();
  });
}

/**
 * Abre configuração do carrinho (wrapper para abrirConfig)
 * @param {string} nome - Nome do produto
 * @param {number} preco - Preço base
 * @param {string} sabor - Sabor
 */
export function abrirConfigCarrinho(nome, preco = 0, sabor = null) {
  abrirConfig(nome, preco, sabor);
}

/**
 * Abre o modal do carrinho completo
 */
export function abrirCarrinho() {
  const overlay = criarOverlay();
  overlay.classList.add("active");

  const modal = document.createElement("div");
  modal.id = "modal-root";
  modal.className = "modal-box";

  const headerDiv = document.createElement("div");
  headerDiv.className = "modal-topo";
  headerDiv.innerHTML = `
    <h2 style="display: flex; align-items: center; gap: 8px;">
      <i class="fa-solid fa-shopping-cart"></i>
      Carrinho
    </h2>
  `;
  modal.appendChild(headerDiv);

  const scrollDiv = document.createElement("div");
  scrollDiv.className = "modal-scroll";

  const carrinhoListaDiv = document.createElement("div");
  carrinhoListaDiv.id = "carrinhoLista";
  carrinhoListaDiv.className = "carrinho-lista";
  scrollDiv.appendChild(carrinhoListaDiv);

  modal.appendChild(scrollDiv);

  const footerDiv = document.createElement("div");
  footerDiv.className = "modal-footer";
  footerDiv.innerHTML = `
    <div class="carrinho-total">
      <span>Total:</span>
      <span id="totalCarrinho">R$ 0,00</span>
    </div>
    <button class="btn modal-fechar-carrinho">Fechar</button>
    <button class="btn modal-finalizar">Finalizar pedido</button>
  `;

  modal.appendChild(footerDiv);
  overlay.appendChild(modal);

  atualizarUIcarrinho();

  const btnFechar = modal.querySelector(".modal-fechar-carrinho");
  const btnFinalizar = modal.querySelector(".modal-finalizar");

  btnFechar?.addEventListener("click", () => fecharModais());

  btnFinalizar?.addEventListener("click", async () => {
    const itens = carrinho.getItens();
    if (!itens || itens.length === 0) {
      mostrarToast("Seu carrinho está vazio");
      return;
    }

    const payload = {
      endereco_id: modalState.endereco?.id || null,
      cliente_nome: modalState.endereco?.nome || modalState.item?.nome || "Cliente",
      telefone: modalState.endereco?.telefone || null,
      pagamento: modalState.pagamento || "dinheiro",
      total: itens.reduce((s, it) => s + (it.total || 0), 0),
      itens: itens.map((it) => ({
        produto_nome: it.nome,
        quantidade: it.quantidade,
        preco_unitario: it.precoUnitario || it.preco || 0,
        subtotal: it.total || it.precoUnitario * it.quantidade,
        observacoes: it.observacoes || ""
      })),
      troco_para: modalState.trocoPara || null
    };

    const token = localStorage.getItem("token");
    if (!token) {
      mostrarToast(
        "Faça login para finalizar o pedido. Seu pedido foi salvo localmente.",
        "aviso"
      );
      return;
    }

    try {
      const resp = await fetch("/api/pedido", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        const txt = await resp.text().catch(() => null);
        console.error("Erro ao criar pedido:", resp.status, txt);
        mostrarToast(
          "Não foi possível finalizar o pedido no servidor. Tente novamente.",
          "erro"
        );
        return;
      }

      const data = await resp.json().catch(() => null);

      carrinho.limpar();
      atualizarBadge();
      await atualizarUIcarrinho();
      mostrarToast("Pedido realizado com sucesso!");
      fecharModais();
      resetState();

      if (data && data.id) {
        console.log("Pedido criado com ID:", data.id);
      }
    } catch (err) {
      console.error("Erro conexão pedido:", err);
      mostrarToast("Erro ao conectar ao servidor. Seu pedido está salvo localmente.", "erro");
    }
  });
}

/**
 * Bind do fechamento de modal via overlay
 */
export function bindCloseModal() {
  const overlay = document.getElementById("modal-overlay");
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) fecharModais();
    });
  }
}

export default {
  abrirConfig,
  abrirConfigCarrinho,
  abrirCarrinho,
  fecharModais,
  bindCloseModal
};