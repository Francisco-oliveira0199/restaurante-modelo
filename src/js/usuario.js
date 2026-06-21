const token =
  localStorage.getItem("token");

if (!token) {

  window.location.href =
    "login.html";

}

document
  .getElementById("btnLogout")
  .addEventListener(
    "click",
    logout
  );

carregarUsuario();
carregarPedidos();

async function carregarUsuario() {

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

    document.getElementById(
      "nomeUsuario"
    ).textContent =
      usuario.nome;

    document.getElementById(
      "emailUsuario"
    ).textContent =
      usuario.email;

    document.getElementById(
      "tipoUsuario"
    ).textContent =
      usuario.tipo;

  } catch (error) {

    console.error(error);

  }

}

async function carregarPedidos() {

  try {

    const response =
      await fetch(
        "http://localhost:3000/usuario/pedidos",
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

    if (!pedidos.length) {

      lista.innerHTML = `
        <p>
          Você ainda não realizou pedidos.
        </p>
      `;

      return;

    }

    pedidos.forEach(pedido => {

      lista.innerHTML += `

        <div class="pedido">

          <div class="pedido-topo">

            <h3>
              Pedido #${pedido.id}
            </h3>

            <span class="
              status
              ${pedido.status}
            ">
              ${formatarStatus(
                pedido.status
              )}
            </span>

          </div>

          <p>
            <strong>Total:</strong>
            R$ ${Number(
              pedido.total
            ).toFixed(2)}
          </p>

          <p>
            <strong>Pagamento:</strong>
            ${pedido.pagamento}
          </p>

          <p>
            <strong>Data:</strong>
            ${new Date(
              pedido.criado_em
            ).toLocaleString(
              "pt-BR"
            )}
          </p>

          <div class="acoes">

            <button
              onclick="
              verPedido(
              ${pedido.id}
              )"
            >
              Ver Detalhes
            </button>

            ${
              pedido.status ===
              "PENDENTE"

              ||

              pedido.status ===
              "AGUARDANDO_PAGAMENTO"

              ?

              `
              <button
              class="cancelar"
              onclick="
              cancelarPedido(
              ${pedido.id}
              )"
              >
              Cancelar
              </button>
              `

              :

              ""

            }

          </div>

        </div>

      `;

    });

  } catch (error) {

    console.error(error);

  }

}

window.cancelarPedido =
async function(id) {

  const confirmar =
    confirm(
      "Deseja cancelar este pedido?"
    );

  if (!confirmar) return;

  try {

    const response =
      await fetch(
        `http://localhost:3000/usuario/pedido/${id}/cancelar`,
        {
          method: "PUT",
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

    const data =
      await response.json();

    if (data.erro) {

      alert(data.erro);

      return;

    }

    alert(
      "Pedido cancelado."
    );

    carregarPedidos();

  } catch (error) {

    console.error(error);

  }

};

window.verPedido =
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

  } catch (error) {

    console.error(error);

  }

};

function formatarStatus(
  status
) {

  const nomes = {

    PENDENTE:
      "Pendente",

    AGUARDANDO_PAGAMENTO:
      "Aguardando Pagamento",

    PAGO:
      "Pago",

    EM_PREPARO:
      "Em Preparo",

    SAIU_PARA_ENTREGA:
      "Saiu para Entrega",

    ENTREGUE:
      "Entregue",

    CANCELADO:
      "Cancelado"

  };

  return nomes[status]
    || status;

}

function logout() {

  localStorage.removeItem(
    "token"
  );

  localStorage.removeItem(
    "usuario"
  );

  window.location.href =
    "login.html";

}