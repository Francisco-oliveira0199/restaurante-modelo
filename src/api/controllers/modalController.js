import { carrinho } from "../main.js";
import { atualizarBadge } from "../ui/badge.js";
import { formatarPreco, normalizarItem } from "../utils/helpers.js";
import { mostrarToast, animarCarrinho } from "../ui/feedback.js";
import { modalState, resetState } from "../state/modalState.js";

function criarOverlay() {
  let overlay = document.getElementById("modal-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "modal-overlay";
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(0,0,0,0.5)";
    overlay.style.zIndex = "9998";
    document.body.appendChild(overlay);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) fecharModais();
    });
  }
  return overlay;
}

function fecharModais() {
  const existing = document.getElementById("modal-root");
  const overlay = document.getElementById("modal-overlay");
  if (existing) existing.remove();
  if (overlay) overlay.remove();
}

function criarModal(titleHtml = "") {
  fecharModais();
  criarOverlay();
  const modal = document.createElement("div");
  modal.id = "modal-root";
  modal.className = "modal-root";
  modal.style.position = "fixed";
  modal.style.left = "50%";
  modal.style.top = "50%";
  modal.style.transform = "translate(-50%,-50%)";
  modal.style.background = "#fff";
  modal.style.padding = "18px";
  modal.style.zIndex = "9999";
  modal.style.maxWidth = "560px";
  modal.style.width = "95%";
  modal.style.maxHeight = "90vh";
  modal.style.overflowY = "auto";
  modal.style.borderRadius = "8px";
  modal.style.boxShadow = "0 8px 30px rgba(0,0,0,0.25)";
  if (titleHtml) {
    const h = document.createElement("div");
    h.innerHTML = titleHtml;
    modal.appendChild(h);
  }
  document.body.appendChild(modal);
  return modal;
}

function calcularPrecoUnitario(precoBase, modalEl) {
  let preco = Number(precoBase) || 0;
  if (!modalEl) return preco;
  modalEl.querySelectorAll("[data-price]").forEach(el => {
    try {
      const checked = (el.type === "checkbox" || el.type === "radio") ? el.checked : true;
      if (!checked) return;
      const p = Number(el.dataset.price || el.dataset.preco || 0);
      if (!Number.isNaN(p)) preco += p;
    } catch (e) {}
  });
  modalEl.querySelectorAll("[data-price-input]").forEach(inp => {
    const v = Number(inp.value);
    if (!Number.isNaN(v)) preco += v;
  });
  return preco;
}

function montarItemDoModal(modalEl) {
  const nome = modalState.item?.nome || modalEl.querySelector(".modal-nome")?.innerText || "Item";
  const precoBase = Number(modalState.precoBase || 0);
  const quantidade = Number(modalEl.querySelector(".modal-quantidade")?.value || 1);
  const sabor1 = modalEl.querySelector(".modal-sabor1")?.value || modalState.config?.sabor1 || null;
  const meioMeio = modalEl.querySelector(".modal-meio-meio") ? modalEl.querySelector(".modal-meio-meio").checked : (modalState.config?.meioMeio || false);
  const sabor2 = meioMeio ? (modalEl.querySelector(".modal-sabor2")?.value || modalState.config?.sabor2 || null) : null;
  const borda = modalEl.querySelector(".modal-borda")?.value || modalState.config?.borda || null;
  const bebida = modalEl.querySelector(".modal-bebida")?.value || modalState.config?.bebida || null;
  const ponto = modalEl.querySelector(".modal-ponto")?.value || modalState.config?.ponto || null;
  const massa = modalEl.querySelector(".modal-massa")?.value || modalState.config?.massa || null;
  const extras = Array.from(modalEl.querySelectorAll(".modal-extra:checked")).map(chk => chk.value);
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

export async function abrirConfig(nome, preco = 0, sabor = null) {
  modalState.item = modalState.item || {};
  modalState.item.nome = nome || modalState.item.nome || "";
  modalState.precoBase = Number(preco || modalState.precoBase || 0);
  if (sabor) {
    modalState.config = modalState.config || {};
    modalState.config.sabor1 = sabor;
  }
  const modal = criarModal(`<h3 class="modal-nome">${modalState.item.nome}</h3>`);
  modal.innerHTML += `
    <div style="margin-top:8px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div style="font-weight:600;">Preço base:</div>
        <div class="modal-preco" style="font-weight:700;">${formatarPreco(Number(modalState.precoBase || 0))}</div>
      </div>
      <div style="margin-top:12px;">
        <label>Quantidade:</label>
        <div style="display:flex;gap:8px;align-items:center;margin-top:6px;">
          <button type="button" class="modal-qty-decr">-</button>
          <input type="number" class="modal-quantidade" value="${modalState.config?.quantidade || 1}" min="1" style="width:64px;text-align:center;padding:6px;border-radius:4px;border:1px solid #ddd;">
          <button type="button" class="modal-qty-incr">+</button>
        </div>
      </div>
      <div style="margin-top:12px;">
        <label>Sabor principal:</label>
        <input type="text" class="modal-sabor1" value="${modalState.config?.sabor1 || (modalState.item?.sabor || '')}" placeholder="Sabor" style="width:100%;padding:8px;border-radius:4px;border:1px solid #ddd;margin-top:6px;">
      </div>
      <div style="margin-top:12px;">
        <label>
          <input type="checkbox" class="modal-meio-meio" ${modalState.config?.meioMeio ? "checked" : ""}>
          Meio a meio (adicionar segundo sabor)
        </label>
        <div style="margin-top:8px; display:${modalState.config?.meioMeio ? "block" : "none"};" class="modal-sabor2-wrap">
          <input type="text" class="modal-sabor2" value="${modalState.config?.sabor2 || ''}" placeholder="Segundo sabor" style="width:100%;padding:8px;border-radius:4px;border:1px solid #ddd;">
        </div>
      </div>
      <div style="margin-top:12px;">
        <label>Borda:</label>
        <select class="modal-borda" style="width:100%;padding:8px;border-radius:4px;border:1px solid #ddd;margin-top:6px;">
          <option value="">-- sem borda --</option>
          <option value="catupiry" data-price="5" ${modalState.config?.borda === "catupiry" ? "selected" : ""}>Catupiry (+R$5,00)</option>
          <option value="cheddar" data-price="6" ${modalState.config?.borda === "cheddar" ? "selected" : ""}>Cheddar (+R$6,00)</option>
        </select>
      </div>
      <div style="margin-top:12px;">
        <label>Extras:</label>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px;">
          <label><input type="checkbox" class="modal-extra" value="bacon" data-price="3"> Bacon (+R$3)</label>
          <label><input type="checkbox" class="modal-extra" value="ovo" data-price="2"> Ovo (+R$2)</label>
          <label><input type="checkbox" class="modal-extra" value="cebola" data-price="1"> Cebola (+R$1)</label>
        </div>
      </div>
      <div style="margin-top:12px;">
        <label>Observações:</label>
        <textarea class="modal-observacoes" rows="3" style="width:100%;padding:8px;border-radius:4px;border:1px solid #ddd;margin-top:6px;">${modalState.config?.observacoes || ""}</textarea>
      </div>
      <div style="margin-top:14px;display:flex;gap:8px;align-items:center;justify-content:flex-end;">
        <div class="modal-total" style="font-weight:700;margin-right:auto;">Total: ${formatarPreco(calcularPrecoUnitario(modalState.precoBase, null) * (modalState.config?.quantidade || 1))}</div>
        <button type="button" class="btn btn-secondary modal-fechar">Fechar</button>
        <button type="button" class="btn btn-primary modal-adicionar">Adicionar ao carrinho</button>
        <button type="button" class="btn btn-success modal-comprar" style="background:#2b9f3b;color:#fff;">Comprar agora</button>
      </div>
    </div>
  `;

  const btnFechar = modal.querySelector(".modal-fechar");
  const btnAdicionar = modal.querySelector(".modal-adicionar");
  const btnComprar = modal.querySelector(".modal-comprar");
  const inputQty = modal.querySelector(".modal-quantidade");
  const btnIncr = modal.querySelector(".modal-qty-incr");
  const btnDecr = modal.querySelector(".modal-qty-decr");
  const meioChk = modal.querySelector(".modal-meio-meio");
  const sabor2Wrap = modal.querySelector(".modal-sabor2-wrap");
  const totalEl = modal.querySelector(".modal-total");

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

  modal.querySelectorAll("[data-price], [data-price-input]").forEach(el => {
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
    mostrarToast("Item adicionado ao carrinho");
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
    mostrarToast("Item adicionado ao carrinho");
    animarCarrinho();
    fecharModais();
    abrirCarrinho();
  });

  function atualizarTotal() {
    const unit = calcularPrecoUnitario(modalState.precoBase, modal);
    const qty = Number(inputQty.value || 1);
    totalEl.innerText = `Total: ${formatarPreco(unit * qty)}`;
  }
}

export function abrirConfigCarrinho(nome, preco = 0, sabor = null) {
  abrirConfig(nome, preco, sabor);
}

export function abrirCarrinho() {
  const modal = criarModal(`<h3>Carrinho</h3>`);
  modal.innerHTML += `
    <div style="margin-top:12px;">
      <div id="carrinhoListaWrapper">
        <div id="carrinhoLista"></div>
      </div>
      <div style="margin-top:12px;display:flex;justify-content:space-between;align-items:center;">
        <div style="font-weight:700;">Total:</div>
        <div id="totalCarrinho" style="font-weight:700;">R$ 0,00</div>
      </div>
      <div style="margin-top:12px;display:flex;gap:8px;justify-content:flex-end;">
        <button class="btn btn-secondary modal-fechar-carrinho">Fechar</button>
        <button class="btn btn-primary modal-finalizar">Finalizar pedido</button>
      </div>
    </div>
  `;

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
      itens: itens.map(it => ({
        produto_nome: it.nome,
        quantidade: it.quantidade,
        preco_unitario: it.precoUnitario || it.preco || 0,
        subtotal: it.total || (it.precoUnitario * it.quantidade),
        observacoes: it.observacoes || ""
      })),
      troco_para: modalState.trocoPara || null
    };

    const token = localStorage.getItem("token");
    if (!token) {
    
      mostrarToast("Faça login para finalizar o pedido. Seu pedido foi salvo localmente.");
      
      return;
    }

    try {
      const resp = await fetch("/pedido", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        const txt = await resp.text().catch(() => null);
        console.error("Erro ao criar pedido:", resp.status, txt);
        mostrarToast("Não foi possível finalizar o pedido no servidor. Tente novamente.", "erro");
        return;
      }

      const data = await resp.json().catch(() => null);
    
      carrinho.limpar();
      atualizarBadge();
      await atualizarUIcarrinho();
      mostrarToast("Pedido realizado com sucesso!");
      fecharModais();

      if (data && data.id) {
        
      }
    } catch (err) {
      console.error("Erro conexão pedido:", err);
      mostrarToast("Erro ao conectar ao servidor. Seu pedido está salvo localmente.", "erro");
    }
  });
}

export default {
  abrirConfig,
  abrirConfigCarrinho,
  abrirCarrinho
};