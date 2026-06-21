function irEntrega() {

  if (modalState.modo === "carrinho") {
    adicionarAoCarrinho();
    return;
  }

  const { box } = getModalElements();

  const resultado = calcularTotal(
    modalState.config,
    modalState.precoBase
  );

  box.innerHTML = view.renderEntrega(resultado.total);

  document
    .getElementById("btnPagamento")
    .addEventListener("click", irPagamento);

  bindCloseModal();

  document
    .getElementById("btnVoltarConfig")
    ?.addEventListener("click", voltarConfig);
}

function irPagamento() {

  const { box } = getModalElements();

  modalState.endereco = {
    rua: document.getElementById("rua").value,
    bairro: document.getElementById("bairro").value,
    numero: document.getElementById("numero").value,
    complemento: document.getElementById("complemento").value
  };

  if (!modalState.endereco.rua || !modalState.endereco.numero) {
    return mostrarErro("Preencha endereço corretamente");
  }

  const resultado = calcularTotal(
    modalState.config,
    modalState.precoBase
  );

  const total = resultado.total;

  modalState.checkoutItens = [
  normalizarItem({
    nome: modalState.item.nome,
    ...modalState.config,
    precoUnitario: resultado.precoUnitario,
    total: resultado.total
  })
];

  box.innerHTML = view.renderPagamento(
    total,
    modalState.endereco
  );

  document.querySelectorAll(".pag-card").forEach(btn => {

    btn.addEventListener("click", () => {

      enviarWhatsApp(btn.dataset.pag);

    });

  });

  document
    .getElementById("btnEditarEndereco")
    .addEventListener("click", voltarEntrega);

  bindCloseModal();
}

function irPagamentoCarrinho() {

  const { box } = getModalElements();

  modalState.endereco = {
    rua: document.getElementById("rua").value,
    bairro: document.getElementById("bairro").value,
    numero: document.getElementById("numero").value,
    complemento: document.getElementById("complemento").value
  };

  const total = carrinho.getTotal();

  box.innerHTML = view.renderPagamento(
    total,
    modalState.endereco
  );

  document.querySelectorAll(".pag-card").forEach(btn => {

    btn.addEventListener("click", () => {

      enviarWhatsApp(btn.dataset.pag);

    });

  });

  bindCloseModal();
}

function voltarEntrega() {
  const { box } = getModalElements();

  const total = modalState.checkoutItens.reduce(
  (acc, item) => acc + item.total,
  0
);

  box.innerHTML = view.renderEntrega(total);

  document.getElementById("rua").value =
    modalState.endereco.rua || "";

  document.getElementById("bairro").value =
    modalState.endereco.bairro || "";

  document.getElementById("numero").value =
    modalState.endereco.numero || "";

    document.getElementById("complemento").value =
  modalState.endereco.complemento || "";

  document
  .getElementById("btnPagamento")
  .addEventListener(
    "click",
    modalState.comprandoDoCarrinho
      ? irPagamentoCarrinho
      : irPagamento
  );

  bindCloseModal();
}

function voltarConfig() {
  abrirConfig(
  modalState.item.nome,
  modalState.precoBase,
  modalState.item.sabor
);
}