export function mostrarToast(msg = "Item adicionado ao carrinho") {
  let toast = document.getElementById("toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.innerText = msg;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

export function mostrarErro(msg = "Algo deu errado") {
  console.error(msg);
  alert(msg);
}

export function animarCarrinho() {
  const btn = document.getElementById("btnCarrinho");
  if (!btn) return;

  btn.classList.add("pulse");

  setTimeout(() => {
    btn.classList.remove("pulse");
  }, 300);
}