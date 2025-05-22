// controlador/adminUsersController.js
import { ensureLoggedIn } from "./authGuard.js";
import { UserService } from "../servicios/UserService.js";
import { BookingService } from "../servicios/BookingService.js";

const user = ensureLoggedIn();
const token = user.token;

if (!user.admin) {
    alert("Acceso denegado. Se requieren privilegios de administrador.");
    window.location.href = "mainMenu.html";
}

const userList = document.getElementById("userList");
const emptyNotice = document.getElementById("emptyNotice");

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await UserService.getAll(token);
        const users = res?.result?.users || res?.users || [];

        if (!users.length) {
            emptyNotice.classList.remove("d-none");
            return;
        }

        emptyNotice.classList.add("d-none");
        renderUsers(users);
    } catch (err) {
        console.error("Error al cargar usuarios:", err);
        alert("Error al cargar usuarios.");
    }
});

function renderUsers(users) {
    userList.innerHTML = "";
    users.forEach(u => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";

        li.innerHTML = `
      <div>
        <strong>${u.name || u.email}</strong><br>
        <small>${u.email}</small>
      </div>
      <button class="btn btn-outline-danger btn-sm" title="Eliminar usuario">
        <i class="bi bi-trash"></i>
      </button>
    `;

        const btnDelete = li.querySelector("button");
        btnDelete.addEventListener("click", async () => {
            const confirmar = confirm(
                `¿Estás seguro de que deseas eliminar a ${u.name || u.email}?\nSe borrarán todas sus reservas.`
            );
            if (!confirmar) return;

            try {
                await BookingService.deleteAllByUser(u._id, token);
                await UserService.deleteAccount(u._id, token);
                li.remove();
                if (!userList.children.length) emptyNotice.classList.remove("d-none");
                alert("Usuario eliminado correctamente.");
            } catch (err) {
                console.error("Error al eliminar usuario:", err);
                alert("Error al eliminar el usuario.");
            }
        });

        userList.appendChild(li);
    });
}
