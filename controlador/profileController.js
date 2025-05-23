// controlador/profileController.js
import { ensureLoggedIn } from "./authGuard.js";
import { UserService } from "../servicios/UserService.js";
import { BookingService } from "../servicios/BookingService.js";

const user = ensureLoggedIn(); // también redirige si no hay sesión
const token = user.token;

// Rellenar datos del perfil
document.getElementById("username").textContent = user.displayName;
document.getElementById("email").textContent = user.email;
document.getElementById("role").textContent = user.admin ? "Administrador" : "Usuario";

// Evento para eliminar cuenta
document.getElementById("btnDeleteAccount").addEventListener("click", async () => {
  const confirmar = confirm(
    "¿Estás seguro de que deseas darte de baja?\nSe eliminarán todas tus reservas de forma permanente."
  );
  if (!confirmar) return;

  try {
    // Eliminar todas las reservas del usuario
    await BookingService.deleteAllByUser(user._id, token);

    // Eliminar el usuario
    await UserService.deleteAccount(user._id, token);

    // Eliminar sesión local y redirigir
    localStorage.removeItem("loggedUser");
    alert("Tu cuenta ha sido eliminada correctamente.");
    window.location.href = "../index.html";
  } catch (err) {
    console.error(err);
    alert("Error al eliminar la cuenta. Inténtalo de nuevo más tarde.");
  }
});
