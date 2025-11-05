const navbar = document.querySelector('.navbar');
const menuToggle = document.getElementById('menu-toggle');
const menu = document.getElementById('menu');

window.addEventListener("scroll", () => {
  const header = document.querySelector("header");
  if (window.scrollY > 10) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    menu.classList.toggle('active');
});

document.querySelectorAll('.menu a').forEach(link => {
    link.addEventListener('click', () => {
        menu.classList.remove('active');
        menuToggle.classList.remove('active');
    });
});