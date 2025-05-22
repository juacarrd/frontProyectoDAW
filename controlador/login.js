import { UserService } from "../servicios/UserService.js";
import { LoggedUserDTO } from "../modelo/LoggedUserDTO.js";
import { CONFIG } from "../config/config.js";

// Se ejecuta cuando el documento HTML ha sido completamente cargado y parseado
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const btnGoogle = document.getElementById("btnGoogleLogin");

  // Manejador de envío del formulario de login clásico (email + contraseña)
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const { success, successData } = await UserService.login(email, password);

      if (!success || !LoggedUserDTO.isValid(successData)) {
        throw new Error("Credenciales incorrectas");
      }

      const user = new LoggedUserDTO(successData);
      localStorage.setItem("loggedUser", JSON.stringify(user.toJSON()));

      // Redirección condicional
      window.location.href = user.admin ? "./vista/adminMenu.html" : "./vista/mainMenu.html";
    } catch (err) {
      console.error(err);
      alert("Inicio de sesión fallido: " + err.message);
    }
  });

  // Manejador del login mediante cuenta de Google
  btnGoogle?.addEventListener("click", async () => {
    try {
      const idToken = await obtenerIdTokenGoogle();
      const userData = await UserService.loginGoogle(idToken);

      if (!LoggedUserDTO.isValid(userData)) {
        throw new Error("Login de Google no válido");
      }

      // Se guarda como usuario normal (Google nunca es admin)
      const user = new LoggedUserDTO(userData);
      user.admin = false;  // fuerza explícitamente el flag
      localStorage.setItem("loggedUser", JSON.stringify(user.toJSON()));

      window.location.href = "./vista/mainMenu.html";
    } catch (err) {
      console.error(err);
      alert("Error al iniciar sesión con Google: " + err.message);
    }
  });
});

// Función que lanza el flujo de autenticación con Google y devuelve el id_token generado
async function obtenerIdTokenGoogle() {
  return new Promise((resolve, reject) => {
    if (!window.google || !google.accounts) {
      return reject("Google Identity Services no está disponible");
    }

    google.accounts.id.initialize({
      client_id: CONFIG.GOOGLE_CLIENT_ID,
      callback: (response) => {
        if (response.credential) {
          resolve(response.credential);
        } else {
          reject("No se obtuvo token de Google");
        }
      }
    });

    google.accounts.id.prompt();
  });
}
