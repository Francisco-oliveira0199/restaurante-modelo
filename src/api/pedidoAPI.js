const API_URL = "http://localhost:3000";

/* Cria um pedido */
export async function criarPedido(pedido) {
  const response = await fetch(`${API_URL}/pedido`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pedido)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.erro || "Erro ao criar pedido");
  }
  return data;
}

/* Lista pedidos (admin) */
export async function listarPedidos(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const response = await fetch(`${API_URL}/pedido${qs ? `?${qs}` : ""}`, { headers: { "Content-Type": "application/json" } });
  return await response.json();
}

/* Buscar pedido por id */
export async function buscarPedido(id) {
  const response = await fetch(`${API_URL}/pedido/${id}`);
  return await response.json();
}

/* Atualizar status (admin) */
export async function atualizarStatus(id, status) {
  const response = await fetch(`${API_URL}/pedido/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  return await response.json();
}

/* Listar pedidos do usuário autenticado (GET /pedido/me) */
export async function listarMeusPedidos(token, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const response = await fetch(`${API_URL}/pedido/me${qs ? `?${qs}` : ""}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : ""
    }
  });
  return await response.json();
}

/* Buscar status do pedido do usuário (GET /pedido/me/:id/status) */
export async function buscarMeuPedidoStatus(token, id) {
  const response = await fetch(`${API_URL}/pedido/me/${id}/status`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : ""
    }
  });
  return await response.json();
}