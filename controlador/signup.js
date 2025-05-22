import { UserService } from "../servicios/UserService.js";
import { LoggedUserDTO } from "../modelo/LoggedUserDTO.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signupForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email    = document.getElementById("email").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (!emailRegex.test(email)) {
      alert("Introduce un correo válido.");
      return;
    }
    if (username.length < 3) {
      alert("El nombre de usuario debe tener al menos 3 caracteres.");
      return;
    }
    if (password.length < 4) {
      alert("La contraseña debe tener al menos 4 caracteres.");
      return;
    }

    try {
      const result = await UserService.signup(email, username, password);

      if (result.alreadyExists) {
        alert("Ya existe un usuario con ese email.");
        return;
      }

      // El servidor no devuelve el token ni el DTO tras registrar,
      // así que pedimos al usuario que inicie sesión
      alert("Usuario registrado correctamente. Inicia sesión.");
      window.location.href = "../index.html";
    } catch (err) {
      console.error("Error en el registro:", err);
      alert("Registro fallido: " + err.message);
    }
  });
});
