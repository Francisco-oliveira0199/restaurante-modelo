const track = document.querySelector(".carousel-track");
const slides = document.querySelectorAll(".destaque-item");
const nextBtn = document.querySelector(".next");
const prevBtn = document.querySelector(".prev");
const indicadores = document.querySelector(".indicadores");

let index = 0;
let interval;

slides.forEach((_, i) => {
  const dot = document.createElement("div");
  if (i === 0) dot.classList.add("ativo");
  indicadores.appendChild(dot);
});

const dots = document.querySelectorAll(".indicadores div");

function atualizar() {
  track.style.transform = `translateX(-${index * 100}%)`;

  dots.forEach(d => d.classList.remove("ativo"));
  dots[index].classList.add("ativo");
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

nextBtn.addEventListener("click", () => {
  stopAuto();
  index = (index + 1) % slides.length;
  atualizar();
  startAuto();
});

prevBtn.addEventListener("click", () => {
  stopAuto();
  index = (index - 1 + slides.length) % slides.length;
  atualizar();
  startAuto();
});

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