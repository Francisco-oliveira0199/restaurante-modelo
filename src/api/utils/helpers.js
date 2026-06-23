export function formatarPreco(v) {
  return `R$ ${v.toFixed(2).replace(".", ",")}`;
}

export function normalizarItem(item) {
  return {
    nome: item.nome,
    tipo: item.tipo,
    precoBase: item.precoBase,
    quantidade: item.quantidade || 1,
    extras: item.extras || [],
    meioMeio: item.meioMeio || false,
    sabor1: item.sabor1 || null,
    sabor2: item.sabor2 || null,
    borda: item.borda || null,
    bebida: item.bebida || null,
    ponto: item.ponto || null,
    massa: item.massa || null,
    precoUnitario: item.precoUnitario,
    total: item.total
  };
}