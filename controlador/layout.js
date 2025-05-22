import { ensureLoggedIn } from "./authGuard.js";

document.addEventListener("DOMContentLoaded", () => {
  const userIcons = document.getElementById("userIcons");
  const btnLogout = document.getElementById("btnLogout");
  const user = JSON.parse(localStorage.getItem("loggedUser"));

  if (user) {
    userIcons?.classList.remove("d-none");

    // Ocultar menú admin si accede alguien que no lo es
    const adminMenu = document.getElementById("adminMenu");
    if (!user.admin && adminMenu) {
      adminMenu.remove();
    }
  } else {
    // redirección por si entra alguien sin sesión
    window.location.href = "../index.html";
  }

  btnLogout?.addEventListener("click", e => {
    e.preventDefault();
    localStorage.removeItem("loggedUser");
    window.location.href = "../index.html";
  });
});
