const API_URL =
  "http://localhost:3000";

export async function criarPedido(
  pedido
) {

  const response =
    await fetch(
      `${API_URL}/pedido`,
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

  const data =
    await response.json();

  if (!response.ok) {

    throw new Error(
      data.erro ||
      "Erro ao criar pedido"
    );

  }

  return data;

}

export async function listarPedidos() {

  const response =
    await fetch(
      `${API_URL}/pedidos`
    );

  return await response.json();

}

export async function buscarPedido(
  id
) {

  const response =
    await fetch(
      `${API_URL}/pedidos/${id}`
    );

  return await response.json();

}

export async function atualizarStatus(
  id,
  status
) {

  const response =
    await fetch(
      `${API_URL}/pedidos/${id}/status`,
      {
        method: "PUT",

        headers: {
          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify({
            status
          })
      }
    );

  return await response.json();

}