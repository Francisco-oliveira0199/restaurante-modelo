export function atualizarPreco() {

  modalState.config = {

    quantidade: Number(
      document.getElementById("quantidadeValor")?.innerText || 1
    ),

    sabor1: modalState.item.sabor || null,

sabor2:
  document.querySelector('input[name="sabor2"]:checked')?.value || null,

    meioMeio: document.getElementById("meioMeio")?.checked,

    borda:
  document.querySelector('input[name="borda"]:checked')?.value || null,

    bebida:
  document.querySelector('input[name="bebida"]:checked')?.value || null,

    ponto:
document.querySelector('input[name="ponto"]:checked')?.value || null,

    massa:
document.querySelector('input[name="massa"]:checked')?.value || null,

    observacoes:
  document.getElementById("observacoes")?.value || "",

    extras: [
      ...document.querySelectorAll(".extra:checked")
    ].map(e => e.value)

  };

  const resultado = calcularTotal(
    modalState.config,
    modalState.precoBase
  );

  document.getElementById("precoTotal").innerText =
    `R$ ${resultado.total.toFixed(2).replace(".", ",")}`;

  const footer = document.getElementById("precoTotalFooter");

  if (footer) {

    footer.innerText =
      `R$ ${resultado.total.toFixed(2).replace(".", ",")}`;

  }

}