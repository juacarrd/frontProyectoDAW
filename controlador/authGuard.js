
// controlador/authGuard.js
export function ensureLoggedIn() {
  const stored = localStorage.getItem("loggedUser");
  if (!stored) {
    window.location.href = "../index.html";   // redirige al login
    return null;
  }
  return JSON.parse(stored);
}
