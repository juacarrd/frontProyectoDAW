// controlador/adminFacilitiesController.js
import { ensureLoggedIn } from "./authGuard.js";
import { FacilityService } from "../servicios/FacilityService.js";
import { FacilityDTO } from "../modelo/FacilityDTO.js";
import { CONFIG } from "../config/config.js";

const user = ensureLoggedIn();
const token = user.token;
const listEl = document.getElementById("facilityList");
const emptyEl = document.getElementById("emptyNotice");

if (!user.admin) {
    alert("Acceso denegado. Se requieren permisos de administrador.");
    window.location.href = "mainMenu.html";
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await FacilityService.getFacilityList(token);
        const facilities = res.facilityListResult.map(f => new FacilityDTO(f));
        render(facilities);
    } catch (err) {
        console.error("Error al cargar instalaciones:", err);
    }
});

function render(facilities) {
    listEl.innerHTML = "";
    if (!facilities.length) {
        emptyEl.classList.remove("d-none");
        return;
    }
    emptyEl.classList.add("d-none");

    facilities.forEach(f => {
        const li = document.createElement("li");
        li.className = "list-group-item";
        li.innerHTML = `
      <article class="d-flex justify-content-between flex-wrap gap-3">
        <section class="flex-grow-1">
          <h2 class="h6 mb-1">${f.name}</h2>
          <p class="mb-1">
            <strong>Ubicación:</strong> ${f.state}, ${f.country}<br>
            <strong>Tipos:</strong> ${f.facilityTypes.join(", ")}
          </p>
        </section>
        <nav class="d-flex align-items-center gap-3">
          <a href="facilityBookings.html?facilityId=${f._id}" class="text-primary fs-5" title="Ver reservas"><i class="bi bi-calendar-check"></i></a>
          <a href="editFacility.html?id=${f._id}" class="text-warning fs-5" title="Editar"><i class="bi bi-pencil"></i></a>
          <button class="btn p-0 text-danger fs-5" title="Eliminar" data-id="${f._id}"><i class="bi bi-trash"></i></button>
        </nav>
      </article>
    `;

        li.querySelector("button").addEventListener("click", async () => {
            if (!confirm("¿Deseas eliminar esta instalación?")) return;
            try {
                await FacilityService.deleteFacility(f._id, token);
                li.remove();
            } catch (err) {
                alert("Error al eliminar la instalación.");
                console.error(err);
            }
        });

        listEl.appendChild(li);
    });
}

