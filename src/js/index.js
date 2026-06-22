document.addEventListener("DOMContentLoaded", () => {
  const track = document.querySelector(".carousel-track");
  const slides = document.querySelectorAll(".destaque-item");
  const nextBtn = document.querySelector(".next");
  const prevBtn = document.querySelector(".prev");
  const indicadores = document.querySelector(".indicadores");

  // Se nenhum elemento do carrossel existir, sair
  if (!track || slides.length === 0 || !indicadores) {
    return;
  }

  let index = 0;
  let interval;

  // criar indicadores apenas se ainda não existirem
  if (indicadores.children.length === 0) {
    slides.forEach((_, i) => {
      const dot = document.createElement("div");
      if (i === 0) dot.classList.add("ativo");
      indicadores.appendChild(dot);
    });
  }

  const dots = document.querySelectorAll(".indicadores div");

  function atualizar() {
    track.style.transform = `translateX(-${index * 100}%)`;

    dots.forEach(d => d.classList.remove("ativo"));
    if (dots[index]) dots[index].classList.add("ativo");
  }

  function startAuto() {
    interval = setInterval(() => {
      index = (index + 1) % slides.length;
      atualizar();
    }, 5000);
  }

  function stopAuto() {
    clearInterval(interval);
  }

  startAuto();

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      stopAuto();
      index = (index + 1) % slides.length;
      atualizar();
      startAuto();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      stopAuto();
      index = (index - 1 + slides.length) % slides.length;
      atualizar();
      startAuto();
    });
  }

  let startX = 0;
  let isDragging = false;

  track.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
    stopAuto();
  });

  track.addEventListener("touchend", (e) => {
    if (!isDragging) return;

    let endX = e.changedTouches[0].clientX;
    let diff = startX - endX;

    if (diff > 50) {
      index = (index + 1) % slides.length;
    } else if (diff < -50) {
      index = (index - 1 + slides.length) % slides.length;
    }

    atualizar();
    startAuto();
    isDragging = false;
  });
});

function irCardapio() {
  window.location.href = "cardapio.html";
}

function irCategoria(categoria) {
  window.location.href = `cardapio.html?cat=${categoria}`;
}

function ligar() {
  window.location.href = "tel:11999999999";
}

function whatsapp() {
  window.open("https://wa.me/5511999999999", "_blank");
}