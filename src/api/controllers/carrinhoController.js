import { carrinho } from "../main.js";
import { atualizarBadge } from "../ui/badge.js";
import { atualizarCarrinhoUI } from "../ui/atualizarCarrinhoUI.js";

export function aumentar(index) {
  carrinho.aumentar(index);

  atualizarCarrinhoUI();
  atualizarBadge();
}

export function diminuir(index) {
  carrinho.diminuir(index);

  atualizarCarrinhoUI();
  atualizarBadge();
}

export function remover(index) {
  carrinho.remover(index);

  atualizarCarrinhoUI();
  atualizarBadge();
}

export function adicionarAoCarrinho() {

  atualizarPreco();

  const resultado = calcularTotal(
    modalState.config,
    modalState.precoBase
  );

  const item = normalizarItem({
    nome: modalState.item.nome,
    ...modalState.config,
    precoUnitario: resultado.precoUnitario,
    total: resultado.total
  });

  carrinho.adicionar(item);

  atualizarBadge();

  animarCarrinho();

  mostrarToast("Item adicionado!");

  fecharModal();
}

export function abrirCarrinho() {
  const { modal, box } = getModalElements();

  if (!modal || !box) return;

  modal.classList.add("active");

  box.innerHTML = `
    <button class="fechar-x" id="fecharModal">
      <i class="fa-solid fa-xmark"></i>
    </button>

    <div class="modal-scroll">

      <h2 class="carrinho-titulo">
         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e08c00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-cart-icon lucide-shopping-cart"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
        Seu Carrinho
      </h2>

      <div class="carrinho-lista" id="carrinhoLista"></div>

      <button class="btn-comprar-tudo" id="btnComprarTudo">
        Comprar Tudo
      </button>

      <button class="btn-limpar-carrinho" id="btnLimparCarrinho">
        Limpar Carrinho
      </button>

      <h3 class="carrinho-total">
        Total:
        <span id="totalCarrinho"></span>
      </h3>

    </div>
  `;

  atualizarCarrinhoUI();

  document
    .getElementById("btnComprarTudo")
    .addEventListener("click", comprarTudo);

  document
    .getElementById("btnLimparCarrinho")
    .addEventListener("click", limparCarrinho);

  bindCloseModal();

  function comprarTudo() {

  const itens = carrinho.getItens();

  if (!itens.length) {
    return mostrarErro("Carrinho vazio");
  }

  modalState.comprandoDoCarrinho = true;

  modalState.modo = "checkout-carrinho";

  modalState.checkoutItens = [...itens];

  const total = modalState.checkoutItens.reduce(
  (acc, item) => acc + item.total,
  0
);

  box.innerHTML = view.renderEntrega(total);

  document
    .getElementById("btnPagamento")
    .addEventListener("click", irPagamentoCarrinho);

  bindCloseModal();
}

  function limparCarrinho() {

    carrinho.limpar();

    atualizarCarrinhoUI();

    atualizarBadge();

    mostrarToast("Carrinho limpo!");

  }
}

function bindCloseModal() {
  const btn = document.getElementById("fecharModal");

  if (!btn) return;

  btn.addEventListener("click", fecharModal);
}