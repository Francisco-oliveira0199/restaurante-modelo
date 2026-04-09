const botoes = document.querySelectorAll(".categoria-btn");
const categorias = document.querySelectorAll(".categoria");

// CLIQUE NOS BOTÕES
botoes.forEach(botao => {
  botao.addEventListener("click", () => {

    botoes.forEach(b => b.classList.remove("active"));
    botao.classList.add("active");

    const id = botao.dataset.id;

    categorias.forEach(cat => {
      cat.classList.remove("active");
    });

    document.getElementById(id).classList.add("active");
  });
});

// 🔥 ABRIR CATEGORIA VIA URL
const params = new URLSearchParams(window.location.search);
const categoriaUrl = params.get("categoria");

if (categoriaUrl) {
  botoes.forEach(btn => {
    btn.classList.remove("active");

    if (btn.dataset.id === categoriaUrl) {
      btn.classList.add("active");
    }
  });

  categorias.forEach(cat => {
    cat.classList.remove("active");
  });

  const categoriaAtiva = document.getElementById(categoriaUrl);
  if (categoriaAtiva) {
    categoriaAtiva.classList.add("active");
  }
}