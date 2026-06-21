const token =
localStorage.getItem("token");

if (!token) {

alert(
"Faça login para finalizar o pedido."
);

window.location.href =
"login.html";

}

let cupomAplicado = null;

let descontoAplicado = 0;

let totalPedido = 0;

const carrinho =
JSON.parse(
localStorage.getItem("carrinho")
) || [];

renderizarResumo();

function renderizarResumo() {

const lista =
document.getElementById(
"resumoPedido"
);

if (!lista) return;

lista.innerHTML = "";

totalPedido = 0;

carrinho.forEach(item => {

totalPedido +=
  Number(item.subtotal);

lista.innerHTML += `

  <div class="item-resumo">

    <span>
      ${item.produto_nome}
    </span>

    <span>
      R$ ${Number(
        item.subtotal
      ).toFixed(2)}
    </span>

  </div>

`;

});

atualizarTotal();

}

function atualizarTotal() {

const totalFinal =
totalPedido -
descontoAplicado;

document.getElementById(
"subtotalPedido"
).textContent =
`R$ ${totalPedido.toFixed(2)}`;

document.getElementById(
"descontoPedido"
).textContent =
`R$ ${descontoAplicado.toFixed(2)}`;

document.getElementById(
"totalPedido"
).textContent =
`R$ ${totalFinal.toFixed(2)}`;

}

document
.getElementById(
"btnAplicarCupom"
)
?.addEventListener(
"click",
aplicarCupom
);

async function aplicarCupom() {

const codigo =
document.getElementById(
"cupom"
).value.trim();

if (!codigo) return;

try {

const response =
  await fetch(
    "http://localhost:3000/cupom/validar",
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json"
      },

      body: JSON.stringify({
        codigo,
        valorPedido:
          totalPedido
      })
    }
  );

const data =
  await response.json();

if (data.erro) {

  alert(data.erro);

  return;

}

cupomAplicado =
  data.cupom.codigo;

descontoAplicado =
  Number(
    data.desconto
  );

atualizarTotal();

alert(
  "Cupom aplicado!"
);

} catch (erro) {

console.error(erro);

alert(
  "Erro ao validar cupom."
);

}

}

document
.getElementById(
"formCheckout"
)
?.addEventListener(
"submit",
finalizarPedido
);

async function finalizarPedido(
e
) {

e.preventDefault();

try {

const metodoPagamento =
  document.getElementById(
    "pagamento"
  ).value;

const troco =
  document.getElementById(
    "troco"
  )?.value || null;

const enderecoId =
  document.getElementById(
    "endereco"
  ).value;

const body = {

  endereco_id:
    enderecoId,

  cliente_nome:
    document.getElementById(
      "clienteNome"
    ).value,

  telefone:
    document.getElementById(
      "telefone"
    ).value,

  pagamento:
    metodoPagamento,

  cupom_codigo:
    cupomAplicado,

  desconto:
    descontoAplicado,

  troco_para:
    troco,

  total:
    (
      totalPedido -
      descontoAplicado
    ),

  itens:
    carrinho

};

const response =
  await fetch(
    "http://localhost:3000/pedido",
    {
      method: "POST",

      headers: {

        "Content-Type":
          "application/json",

        Authorization:
          `Bearer ${token}`

      },

      body:
        JSON.stringify(body)

    }
  );

const pedido =
  await response.json();

if (!pedido.id) {

  alert(
    pedido.erro ||
    "Erro ao criar pedido"
  );

  return;

}

if (
  metodoPagamento ===
  "PIX"
) {

  const pixResponse =
    await fetch(
      "http://localhost:3000/pagamento/pix",
      {
        method: "POST",

        headers: {

          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`

        },

        body:
          JSON.stringify({
            pedido_id:
              pedido.id
          })

      }
    );

  const pix =
    await pixResponse.json();

  localStorage.removeItem(
    "carrinho"
  );

  window.location.href =
    `pix.html?id=${pedido.id}`;

  return;

}

localStorage.removeItem(
  "carrinho"
);

alert(
  "Pedido realizado com sucesso!"
);

window.location.href =
  "usuario.html";

} catch (erro) {

console.error(erro);

alert(
  "Erro ao finalizar pedido."
);

}

}

document
.getElementById(
"pagamento"
)
?.addEventListener(
"change",
function() {

const campoTroco =
  document.getElementById(
    "campoTroco"
  );

if (
  this.value ===
  "DINHEIRO"
) {

  campoTroco.style.display =
    "block";

} else {

  campoTroco.style.display =
    "none";

}

}
);
