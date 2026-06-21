document.addEventListener("DOMContentLoaded", () => {

  const menuButton = document.querySelector(".menu-icon");
  const menuIcon = document.querySelector(".menu-icon i");
  const menuLinks = document.querySelector(".menu-links");

  if (!menuButton || !menuIcon || !menuLinks) return;

  menuButton.addEventListener("click", (e) => {
    e.stopPropagation();

    menuLinks.classList.toggle("active");

    if (menuIcon.classList.contains("fa-bars")) {
      menuIcon.classList.replace("fa-bars", "fa-xmark");
    } else {
      menuIcon.classList.replace("fa-xmark", "fa-bars");
    }
  });

  document.addEventListener("click", () => {
    menuLinks.classList.remove("active");
    menuIcon.classList.replace("fa-xmark", "fa-bars");
  });

});