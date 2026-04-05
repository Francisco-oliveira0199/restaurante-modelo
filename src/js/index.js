const menuIcon = document.querySelector(".menu-icon");
const menuLinks = document.querySelector(".menu-links");
const links = document.querySelectorAll(".menu-links a");

// abrir/fechar menu
menuIcon.addEventListener("click", () => {
  menuLinks.classList.toggle("active");
});

// destacar item clicado
links.forEach(link => {
  link.addEventListener("click", () => {

    links.forEach(l => l.classList.remove("active-link"));
    link.classList.add("active-link");

    // fecha menu depois do clique
    menuLinks.classList.remove("active");
  });
});