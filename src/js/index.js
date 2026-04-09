const menuButton = document.querySelector(".menu-icon");
const menuIcon = document.querySelector(".menu-icon i");
const menuLinks = document.querySelector(".menu-links");

// MENU
menuButton.addEventListener("click", (e) => {
  e.stopPropagation();

  menuLinks.classList.toggle("active");
  menuButton.classList.toggle("active");

  if (menuButton.classList.contains("active")) {
    menuIcon.classList.replace("fa-bars", "fa-xmark");
  } else {
    menuIcon.classList.replace("fa-xmark", "fa-bars");
  }
});

menuLinks.addEventListener("click", (e) => {
  e.stopPropagation();
});

document.addEventListener("click", () => {
  menuLinks.classList.remove("active");
  menuButton.classList.remove("active");

  menuIcon.classList.replace("fa-xmark", "fa-bars");
});

// 📞 TELEFONE
function ligar() {
  window.location.href = "tel:+551112345678";
}

// 💬 WHATSAPP
function whatsapp() {
  window.open("https://wa.me/551112345678", "_blank");
}