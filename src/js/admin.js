const token =
localStorage.getItem("token");

if (!token) {

  window.location.href =
    "login.html";

}

verificarAdmin();

carregarDashboard();

setInterval(() => {

  carregarPedidos();

  carregarMetricas();

}, 15000);

async function verificarAdmin() {

  try {

    const response =
      await fetch(
        "http://localhost:3000/usuario/perfil",
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

    const usuario =
      await response.json();

    if (
      usuario.tipo !== "ADMIN"
    ) {

      alert(
        "Acesso negado"
      );

      window.location.href =
        "index.html";

    }

  } catch {

    window.location.href =
      "login.html";

  }

}

async function carregarDashboard() {

  await carregarMetricas();

  await carregarPedidos();

}

async function carregarMetricas() {

  try {

    const response =
      await fetch(
        "http://localhost:3000/dashboard",
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

    const dados =
      await response.json();

    document.getElementById(
      "pedidosHoje"
    ).textContent =
      dados.pedidosHoje || 0;

    document.getElementById(
      "faturamentoHoje"
    ).textContent =
      `R$ ${
        Number(
          dados.faturamentoHoje || 0
        ).toFixed(2)
      }`;

    document.getElementById(
      "pedidosPendentes"
    ).textContent =
      dados.pendentes || 0;

  } catch (erro) {

    console.error(erro);

  }

}

async function carregarPedidos() {

  try {

    const response =
      await fetch(
        "http://localhost:3000/pedido",
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

    const pedidos =
      await response.json();

    const lista =
      document.getElementById(
        "listaPedidos"
      );

    lista.innerHTML = "";

    pedidos.forEach(pedido => {

      lista.innerHTML += `

      <div class="pedido-card">

        <h3>
          Pedido #${pedido.id}
        </h3>

        <p>
          Cliente:
          ${pedido.cliente_nome || "-"}
        </p>

        <p>
          Telefone:
          ${pedido.telefone || "-"}
        </p>

        <p>
          Total:
          R$ ${Number(
            pedido.total
          ).toFixed(2)}
        </p>

        <p>
          Pagamento:
          ${pedido.pagamento}
        </p>

        ${
          pedido.troco_para
          ?
          `
          <p>
            Troco para:
            R$ ${pedido.troco_para}
          </p>
          `
          :
          ""
        }

        <p>
          Status:
          <strong>
            ${pedido.status}
          </strong>
        </p>

        <p>
          Data:
          ${new Date(
            pedido.criado_em
          ).toLocaleString(
            "pt-BR"
          )}
        </p>

        <select
          onchange="
          atualizarStatus(
            ${pedido.id},
            this.value
          )"
        >

          <option
          value="PENDENTE"
          ${
            pedido.status ===
            "PENDENTE"
            ? "selected"
            : ""
          }>
          PENDENTE
          </option>

          <option
          value="AGUARDANDO_PAGAMENTO"
          ${
            pedido.status ===
            "AGUARDANDO_PAGAMENTO"
            ? "selected"
            : ""
          }>
          AGUARDANDO PAGAMENTO
          </option>

          <option
          value="PAGO"
          ${
            pedido.status ===
            "PAGO"
            ? "selected"
            : ""
          }>
          PAGO
          </option>

          <option
          value="EM_PREPARO"
          ${
            pedido.status ===
            "EM_PREPARO"
            ? "selected"
            : ""
          }>
          EM PREPARO
          </option>

          <option
          value="SAIU_PARA_ENTREGA"
          ${
            pedido.status ===
            "SAIU_PARA_ENTREGA"
            ? "selected"
            : ""
          }>
          SAIU PARA ENTREGA
          </option>

          <option
          value="ENTREGUE"
          ${
            pedido.status ===
            "ENTREGUE"
            ? "selected"
            : ""
          }>
          ENTREGUE
          </option>

          <option
          value="CANCELADO"
          ${
            pedido.status ===
            "CANCELADO"
            ? "selected"
            : ""
          }>
          CANCELADO
          </option>

        </select>

        <button
        onclick="
        visualizarPedido(
          ${pedido.id}
        )">
        Ver Detalhes
        </button>

      </div>

      `;

    });

  } catch (erro) {

    console.error(erro);

  }

}

window.atualizarStatus =
async function(
  pedidoId,
  status
) {

  try {

    await fetch(
      `http://localhost:3000/pedido/${pedidoId}/status`,
      {

        method: "PUT",

        headers: {

          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`

        },

        body:
          JSON.stringify({
            status
          })

      }
    );

    carregarPedidos();

    carregarMetricas();

  } catch (erro) {

    console.error(erro);

  }

};

window.visualizarPedido =
async function(id) {

  try {

    const response =
      await fetch(
        `http://localhost:3000/pedido/${id}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

    const pedido =
      await response.json();

    let texto =
      `Pedido #${pedido.id}\n\n`;

    pedido.itens.forEach(item => {

      texto +=
      `${item.quantidade}x ${item.produto_nome}\n`;

    });

    texto +=
      `\nTotal: R$ ${pedido.total}`;

    alert(texto);

  } catch (erro) {

    console.error(erro);

  }

};