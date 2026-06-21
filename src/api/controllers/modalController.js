import { modalState } from "../state/modalState.js";
import { calcularTotal } from "../services/pedidoService.js";
import * as view from "../views/modalView.js";
import { carrinho } from "../main.js";
import { atualizarBadge } from "../ui/badge.js";
import { mostrarToast, mostrarErro, animarCarrinho } from "../ui/feedback.js";
import { resetState } from "../state/modalState.js";
import { normalizarItem } from "../utils/helpers.js";
import { atualizarCarrinhoUI } from "../ui/atualizarCarrinhoUI.js";
import {
  criarPedido
}
from "../api/pedidoAPI.js";

function getModalElements() {
  return {
    modal: document.getElementById("modalPedido"),
    box: document.querySelector(".modal-box")
  };
}

modalState.modo = "compra-direta";
export function abrirConfigCarrinho(nome, preco, sabor = null) {

  modalState.modo = "carrinho";

  abrirConfig(nome, preco, sabor);

}

export function abrirConfig(nome, preco, sabor = null) {

  const { modal, box } = getModalElements();

  const mesmoItem =
  modalState.item.nome === nome &&
  modalState.item.sabor === sabor;

if (!mesmoItem) {

  const modoAtual = modalState.modo;

  resetState();

  modalState.modo = modoAtual;

  modalState.item.nome = nome;

  modalState.precoBase = preco;

  modalState.item.sabor = sabor;
}

  modal.classList.add("active");

  box.innerHTML = view.renderConfig(nome, preco);

  montarExtras();

  bindEvents();

  bindCloseModal();

  restaurarConfig();

  atualizarPreco();
}

function getTipo() {
  const nome = modalState.item.nome.toLowerCase();

  if (nome.includes("pizza")) return "pizza";
  if (nome.includes("x-") || nome.includes("burger")) return "hamburguer";
  if (nome.includes("pastel")) return "pastel";

  return "outro";
}

function montarExtras() {
  const tipo = getTipo();

  const el = document.getElementById("extras");

  if (!el) return;

  if (tipo === "pizza") {

    el.innerHTML = `

     <div class="secao">

    <h3>Borda recheada</h3>

    <label class="radio-option">
      <input
        type="radio"
        name="borda"
        value=""
        checked
      >
      <p>Sem borda</p>
    </label>

    <label class="radio-option">
      <input
        type="radio"
        name="borda"
        value="catupiry"
      >
      <p>Catupiry</p> <span>+R$ 5</span>
    </label>

    <label class="radio-option">
      <input
        type="radio"
        name="borda"
        value="cheddar"
      >
      <p>Cheddar</p> <span>+R$ 6</span>
    </label>

    <label class="radio-option">
      <input
        type="radio"
        name="borda"
        value="chocolate"
      >
      <p>Chocolate</p> <span>+R$ 8</span>
    </label>

    <label class="radio-option">
      <input
        type="radio"
        name="borda"
        value="cream-cheese"
      >
      <p>Cream Cheese</p> <span>+R$ 8</span>
    </label>

  </div>

  <div class="secao">

    <h3>Pizza meio a meio</h3>

    <label class="radio-option">
      <input
        type="checkbox"
        id="meioMeio"
      >
      Quero metade com outro sabor
    </label>

    <div
      id="saboresMeioMeio"
      style="display:none;"
    >

      <h4>Escolha o segundo sabor</h4>

      <label class="radio-option">
        <input
          type="radio"
          name="sabor2"
          value="calabresa"
        >
        Calabresa
      </label>

      <label class="radio-option">
        <input
          type="radio"
          name="sabor2"
          value="frango-com-catupiry"
        >
        Frango com Catupiry
      </label>

      <label class="radio-option">
        <input
          type="radio"
          name="sabor2"
          value="mussarela"
        >
        Mussarela
      </label>

      <label class="radio-option">
      <input
        type="radio"
        name="sabor2"
        value="portuguesa"
      >
      Portuguesa
    </label>

    <label class="radio-option">
      <input
        type="radio"
        name="sabor2"
        value="quatro-queijos"
      >
      Quatro Queijos
    </label>

    <label class="radio-option">
      <input
        type="radio"
        name="sabor2"
        value="pepperoni"
      >
      Pepperoni
    </label>

    </div>

  </div>

  <div class="secao">

    <h3>Extras</h3>

    <label class="radio-option">
      <input
        type="checkbox"
        class="extra"
        value="bacon"
      >
      <p>Bacon</p> <span>+R$ 3</span>
    </label>

    <label class="radio-option">
      <input
        type="checkbox"
        class="extra"
        value="queijo"
      >
      <p>Queijo extra</p> <span>+R$ 2</span>
    </label>

    <label class="radio-option">
      <input
        type="checkbox"
        class="extra"
        value="calabresa"
      >
      <p>Calabresa</p> <span>+R$ 4</span>
    </label>

    <label class="radio-option">
      <input
        type="checkbox"
        class="extra"
        value="ovo"
      >
      <p>Ovo</p> <span>+R$ 2</span>
    </label>

    <label class="radio-option">
      <input
        type="checkbox"
        class="extra"
        value="milho"
      >
      <p>Milho</p> <span>+R$ 2</span>
    </label>

    <label class="radio-option">
      <input
        type="checkbox"
        class="extra"
        value="cebola"
      >
      <p>Cebola</p> <span>+R$ 1,50</span>
    </label>

  </div>

  <div class="secao">

    <h3>Bebida</h3>

    <label class="radio-option">
      <input
        type="radio"
        name="bebida"
        value=""
        checked
      >
      <p>Sem bebida</p>
    </label>

    <label class="radio-option">
      <input
        type="radio"
        name="bebida"
        value="coca-lata"
      >
      <p>Coca-Cola Lata</p> <span>+R$ 6</span>
    </label>

    <label class="radio-option">
      <input
        type="radio"
        name="bebida"
        value="guarana"
      >
      <p>Guaraná Antarctica</p> <span>+R$ 6</span>
    </label>

    <label class="radio-option">
      <input
        type="radio"
        name="bebida"
        value="coca-1l"
      >
      <p>Coca-Cola 1L</p> <span>+R$ 10,00</span>
    </label>

    <label class="radio-option">
      <input
        type="radio"
        name="bebida"
        value="laranja"
      >
      <p>Suco de Laranja</p> <span>+R$ 12,00</span>
    </label>

    <label class="radio-option">
      <input
        type="radio"
        name="bebida"
        value="agua"
      >
      <p>Água Mineral</p> <span>+R$ 4,00</span>
    </label>

  </div>

  <div class="secao">

    <h3>Observações</h3>

    <textarea
      id="observacoes"
      placeholder="Ex: sem cebola, mais assada..."
    ></textarea>

  </div>

    `;

    document
  .getElementById("meioMeio")
  ?.addEventListener("change", e => {

    const box =
      document.getElementById("saboresMeioMeio");

    box.style.display =
      e.target.checked ? "block" : "none";

    if (!e.target.checked) {

      document
        .querySelectorAll('input[name="sabor2"]')
        .forEach(radio => {

          radio.checked = false;

        });

    }

    atualizarPreco();

});

    const meioMeio =
  document.getElementById("meioMeio");

document.getElementById("saboresMeioMeio").style.display =
  meioMeio?.checked ? "block" : "none";
  }

  if (tipo === "hamburguer") {

    el.innerHTML = `

      <div class="secao">

  <h3>Adicionais</h3>

  <label class="radio-option">
    <input
      type="checkbox"
      class="extra"
      value="bacon"
    >
    <p>Bacon</p>
    <span>+R$ 4</span>
  </label>

  <label class="radio-option">
    <input
      type="checkbox"
      class="extra"
      value="queijo"
    >
    <p>Queijo extra</p>
    <span>+R$ 3</span>
  </label>

  <label class="radio-option">
    <input
      type="checkbox"
      class="extra"
      value="cebola-caramelizada"
    >
    <p>Cebola caramelizada</p>
    <span>+R$ 3</span>
  </label>

  <label class="radio-option">
    <input
      type="checkbox"
      class="extra"
      value="ovo"
    >
    <p>Ovo</p>
    <span>+R$ 2</span>
  </label>

  <label class="radio-option">
    <input
      type="checkbox"
      class="extra"
      value="picles"
    >
    <p>Picles</p>
    <span>+R$ 2</span>
  </label>

</div>

<div class="secao">

  <h3>Ponto da carne</h3>

  <label class="radio-option">
    <input
      type="radio"
      name="ponto"
      value="mal-passado"
    >
    <p>Mal passado</p>
  </label>

  <label class="radio-option">
    <input
      type="radio"
      name="ponto"
      value="ao-ponto"
      checked
    >
    <p>Ao ponto</p>
  </label>

  <label class="radio-option">
    <input
      type="radio"
      name="ponto"
      value="bem-passado"
    >
    <p>Bem passado</p>
  </label>

</div>

<div class="secao">

  <h3>Bebida</h3>

  <label class="radio-option">
    <input
      type="radio"
      name="bebida"
      value=""
      checked
    >
    <p>Sem bebida</p>
  </label>

  <label class="radio-option">
    <input
      type="radio"
      name="bebida"
      value="coca-lata"
    >
    <p>Coca-Cola Lata</p>
    <span>+R$ 6</span>
  </label>

  <label class="radio-option">
    <input
      type="radio"
      name="bebida"
      value="guarana"
    >
    <p>Guaraná Antarctica</p>
    <span>+R$ 6</span>
  </label>

  <label class="radio-option">
    <input
      type="radio"
      name="bebida"
      value="suco de laranja"
    >
    <p>Suco Natural de Laranja</p>
    <span>+R$ 10</span>
  </label>

  <label class="radio-option">
    <input
      type="radio"
      name="bebida"
      value="agua"
    >
    <p>Água Mineral</p>
    <span>+R$ 4</span>
  </label>

</div>

<div class="secao">

  <h3>Observações</h3>

  <textarea
    id="observacoes"
    placeholder="Ex: sem cebola, molho separado..."
  ></textarea>

</div>

    `;
  }

  if (tipo === "pastel") {

    el.innerHTML = `

      <div class="secao">

  <h3>Adicionais</h3>

  <label class="radio-option">
    <input
      type="checkbox"
      class="extra"
      value="queijo"
    >
    <p>Queijo extra</p>
    <span>+R$ 3</span>
  </label>

  <label class="radio-option">
    <input
      type="checkbox"
      class="extra"
      value="milho"
    >
    <p>Milho</p>
    <span>+R$ 2</span>
  </label>

  <label class="radio-option">
    <input
      type="checkbox"
      class="extra"
      value="bacon"
    >
    <p>Bacon crocante</p>
    <span>+R$ 4</span>
  </label>

  <label class="radio-option">
    <input
      type="checkbox"
      class="extra"
      value="catupiry"
    >
    <p>Catupiry</p>
    <span>+R$ 3</span>
  </label>

  <label class="radio-option">
    <input
      type="checkbox"
      class="extra"
      value="calabresa"
    >
    <p>Calabresa</p>
    <span>+R$ 4</span>
  </label>

</div>

<div class="secao">

  <h3>Tipo de massa</h3>

  <label class="radio-option">
    <input
      type="radio"
      name="massa"
      value="tradicional"
      checked
    >
    <p>Tradicional</p>
  </label>

  <label class="radio-option">
    <input
      type="radio"
      name="massa"
      value="pizza"
    >
    <p>Massa sabor pizza</p>
    <span>+R$ 2</span>
  </label>

  <label class="radio-option">
    <input
      type="radio"
      name="massa"
      value="integral"
    >
    <p>Massa integral</p>
    <span>+R$ 3</span>
  </label>

</div>

<div class="secao">

  <h3>Bebida</h3>

  <label class="radio-option">
    <input
      type="radio"
      name="bebida"
      value=""
      checked
    >
    <p>Sem bebida</p>
  </label>

  <label class="radio-option">
    <input
      type="radio"
      name="bebida"
      value="coca-lata"
    >
    <p>Coca-Cola Lata</p>
    <span>+R$ 6</span>
  </label>

  <label class="radio-option">
    <input
      type="radio"
      name="bebida"
      value="guarana"
    >
    <p>Guaraná Antarctica</p>
    <span>+R$ 6</span>
  </label>

  <label class="radio-option">
    <input
      type="radio"
      name="bebida"
      value="suco de laranja"
    >
    <p>Suco Natural de Laranja</p>
    <span>+R$ 10</span>
  </label>

  <label class="radio-option">
    <input
      type="radio"
      name="bebida"
      value="agua"
    >
    <p>Água Mineral</p>
    <span>+R$ 4</span>
  </label>

</div>

<div class="secao">

  <h3>Observações</h3>

  <textarea
    id="observacoes"
    placeholder="Ex: pouco óleo, bem crocante, molho separado..."
  ></textarea>

</div>

    `;
  }
}

function restaurarConfig() {

  const config = modalState.config;

  document.getElementById("quantidadeValor").innerText =
  config.quantidade || 1;

  if (document.getElementById("sabor1")) {
    document.getElementById("sabor1").value =
      config.sabor1 || "";

  const obs =
  document.getElementById("observacoes");

if (obs) {
  obs.value = config.observacoes || "";
}
  }

if (config.sabor2) {

  const radio = document.querySelector(
    `input[name="sabor2"][value="${config.sabor2}"]`
  );

  if (radio) {
    radio.checked = true;
  }

}

  if (document.getElementById("meioMeio")) {
    document.getElementById("meioMeio").checked =
      config.meioMeio || false;
  }

  if (config.borda) {

  const radio = document.querySelector(
    `input[name="borda"][value="${config.borda}"]`
  );

  if (radio) {
    radio.checked = true;
  }

}

  const bebida = document.querySelector(
  `input[name="bebida"][value="${config.bebida}"]`
);

if (bebida) {
  bebida.checked = true;
}

  if (config.ponto) {

  const radio = document.querySelector(
    `input[name="ponto"][value="${config.ponto}"]`
  );

  if (radio) {
    radio.checked = true;
  }

}

  if (config.massa) {

  const radio = document.querySelector(
    `input[name="massa"][value="${config.massa}"]`
  );

  if (radio) {
    radio.checked = true;
  }

}

  document.querySelectorAll(".extra").forEach(extra => {

    extra.checked =
      config.extras?.includes(extra.value);

   });

  }

function bindEvents() {
  document.getElementById("btnContinuar")
    .addEventListener("click", irEntrega);

    document
  .getElementById("btnAdicionarCarrinho")
  ?.addEventListener("click", adicionarAoCarrinho);

const menos = document.getElementById("menosQtd");
const mais = document.getElementById("maisQtd");
const valor = document.getElementById("quantidadeValor");

if (menos && mais && valor) {

  menos.addEventListener("click", () => {

    let qtd = Number(valor.innerText);

    if (qtd > 1) {
      qtd--;
    }

    valor.innerText = qtd;

    atualizarPreco();

  });

  mais.addEventListener("click", () => {

    let qtd = Number(valor.innerText);

    qtd++;

    valor.innerText = qtd;

    atualizarPreco();

  });

}

  document.getElementById("extras")
    .addEventListener("change", atualizarPreco);
}

export function fecharModal() {
  const { modal, box } = getModalElements();

  modal.classList.remove("active");
  box.innerHTML = "";

    resetState();
}

export async function listarMeusPedidos(
  req,
  res
) {

  const usuarioId =
    req.usuario.id;

  const result =
    await pool.query(
      `
      SELECT *
      FROM pedidos
      WHERE usuario_id = $1
      ORDER BY id DESC
      `,
      [usuarioId]
    );

  res.json(
    result.rows
  );

}

async function finalizarPedido() {

  const pedido = {

    cliente_nome:
      modalState.usuario.nome,

    telefone:
      modalState.usuario.telefone,

    endereco:
      modalState.endereco,

    pagamento:
      modalState.pagamento,

    total:
      carrinho.getTotal(),

    itens:
      modalState.checkoutItens

  };

  await fetch(
    "http://localhost:3000/pedido",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json"
      },
      body:
        JSON.stringify(pedido)
    }
  );

}

import {
  criarPix
}
from "../services/paymentService.js";

const pix =
  await criarPix({

    id: pedido.id,

    nome:
      pedido.cliente_nome,

    email:
      pedido.email,

    total:
      pedido.total

  });





