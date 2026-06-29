const carts = new Map();

function ensureCart(userId) {
  const id = String(userId || "anon");
  if (!carts.has(id)) carts.set(id, []);
  return carts.get(id);
}

function getItemByIndex(cart, index) {
  const idx = Number(index);
  if (!Array.isArray(cart)) return { error: "Carrinho inválido" };
  if (Number.isNaN(idx) || idx < 0 || idx >= cart.length) {
    return { error: "Índice inválido" };
  }
  return { item: cart[idx], index: idx };
}

/**
 * Adiciona um item ao carrinho
 * @param {string|number} userId
 * @param {object} item - { nome, precoUnitario, quantidade, config? }
 * @returns {object} item adicionado
 */
export function adicionar(userId, item) {
  const cart = ensureCart(userId);

  if (!item || typeof item !== "object") {
    throw new Error("Item inválido");
  }

  const quantidade = Number(item.quantidade) || 1;
  const precoUnitario = Number(item.precoUnitario) || 0;
  const nome = String(item.nome || "");

  const existingIndex = cart.findIndex(i =>
    i.nome === nome && JSON.stringify(i.config || {}) === JSON.stringify(item.config || {})
  );

  if (existingIndex >= 0) {
    cart[existingIndex].quantidade += quantidade;
    cart[existingIndex].total = cart[existingIndex].quantidade * (cart[existingIndex].precoUnitario || 0);
    return cart[existingIndex];
  }

  const newItem = {
    nome,
    quantidade,
    precoUnitario,
    total: quantidade * precoUnitario,
    config: item.config || {}
  };

  cart.push(newItem);
  return newItem;
}

export function aumentar(userIdOrReq, indexOrRes) {
  
  if (typeof userIdOrReq !== "object" || !userIdOrReq?.headers) {
    const userId = userIdOrReq;
    const index = indexOrRes;
    const cart = ensureCart(userId);
    const { error, item } = getItemByIndex(cart, index);
    if (error) throw new Error(error);
    item.quantidade = Number(item.quantidade || 0) + 1;
    item.total = Number(item.precoUnitario || 0) * item.quantidade;
    return item;
  }

  const req = userIdOrReq;
  const res = indexOrRes;
  try {
    const userId = req.usuario?.id || req.body.userId || "anon";
    const index = req.params?.index ?? req.body?.index;
    const result = aumentar(userId, index);
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ erro: err.message });
  }
}

export function diminuir(userIdOrReq, indexOrRes) {
  if (typeof userIdOrReq !== "object" || !userIdOrReq?.headers) {
    const userId = userIdOrReq;
    const index = indexOrRes;
    const cart = ensureCart(userId);
    const { error, item, index: idx } = getItemByIndex(cart, index);
    if (error) throw new Error(error);
    item.quantidade = Math.max(0, Number(item.quantidade || 0) - 1);
    item.total = Number(item.precoUnitario || 0) * item.quantidade;
    
    if (item.quantidade === 0) {
      cart.splice(idx, 1);
      return { removed: true };
    }
    return item;
  }

  const req = userIdOrReq;
  const res = indexOrRes;
  try {
    const userId = req.usuario?.id || req.body.userId || "anon";
    const index = req.params?.index ?? req.body?.index;
    const result = diminuir(userId, index);
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ erro: err.message });
  }
}

export function remover(userIdOrReq, indexOrRes) {
  if (typeof userIdOrReq !== "object" || !userIdOrReq?.headers) {
    const userId = userIdOrReq;
    const index = indexOrRes;
    const cart = ensureCart(userId);
    const { error, index: idx } = getItemByIndex(cart, index);
    if (error) throw new Error(error);
    cart.splice(idx, 1);
    return { removed: true };
  }

  const req = userIdOrReq;
  const res = indexOrRes;
  try {
    const userId = req.usuario?.id || req.body.userId || "anon";
    const index = req.params?.index ?? req.body?.index;
    const result = remover(userId, index);
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ erro: err.message });
  }
}

export function limparCarrinho(userIdOrReq, resOptional) {
  if (typeof userIdOrReq !== "object" || !userIdOrReq?.headers) {
    const userId = userIdOrReq;
    const id = String(userId || "anon");
    carts.set(id, []);
    return { ok: true };
  }

  const req = userIdOrReq;
  const res = resOptional;
  try {
    const userId = req.usuario?.id || req.body.userId || "anon";
    const result = limparCarrinho(userId);
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ erro: err.message });
  }
}

export function obterTotal(userId) {
  const cart = ensureCart(userId);
  return cart.reduce((acc, itm) => acc + Number(itm.total || 0), 0);
}

export function getItens(userId) {
  return ensureCart(userId);
}

export default {
  adicionar,
  aumentar,
  diminuir,
  remover,
  limparCarrinho,
  obterTotal,
  getItens
};