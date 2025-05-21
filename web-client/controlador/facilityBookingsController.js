// controlador/facilityBookingsController.js
import { ensureLoggedIn } from "./authGuard.js";
import { BookingService } from "../servicios/BookingService.js";
import { FacilityService } from "../servicios/FacilityService.js";
import { FacilityTypesReverse } from "../modelo/FacilityTypes.js";

const user = ensureLoggedIn();
const token = user.token;

if (!user.admin) {
    alert("Acceso denegado. Se requieren permisos de administrador.");
    window.location.href = "mainMenu.html";
}

const params = new URLSearchParams(location.search);
const facilityId = params.get("facilityId");

const listEl = document.getElementById("bookingList");
const emptyEl = document.getElementById("emptyNotice");
const facilityNameEl = document.getElementById("facilityName");

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const { facility } = await FacilityService.getOne(facilityId, token);
        facilityNameEl.textContent = `${facility.name} – ${facility.state}, ${facility.country}`;

        const { bookings = [] } = await BookingService.getAllByFacility(facilityId, token);
        render(bookings);
    } catch (err) {
        console.error("Error:", err);
        listEl.innerHTML = `<div class="alert alert-danger">Error al cargar las reservas.</div>`;
    }
});

/** Muestra un mensaje flotante que se desvanece solo (Bootstrap 5) */
function flash(msg, type = "success") {
    const id = "id_" + Date.now();
    const html = `
    <div id="${id}" class="alert alert-${type} alert-dismissible fade show shadow-sm" role="alert">
      ${msg}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
    </div>`;
    const cont = document.getElementById("flashContainer");
    cont.insertAdjacentHTML("beforeend", html);
    // Se desvanece solo a los 4 s
    setTimeout(() => {
        const el = document.getElementById(id);
        if (el) bootstrap.Alert.getOrCreateInstance(el).close();
    }, 4000);
}


function fmt(ts) {
    return new Date(ts).toLocaleString("es-ES");
}

function render(reservas) {
    listEl.innerHTML = "";
    if (!reservas.length) { emptyEl.classList.remove("d-none"); return; }
    emptyEl.classList.add("d-none");

    reservas.forEach(r => {
        const li = document.createElement("li");
        li.className = "list-group-item";
        li.innerHTML = `
      <article class="d-flex justify-content-between flex-wrap gap-3">
        <section class="flex-grow-1">
          <p class="mb-1">
            <strong>Tipo:</strong> ${FacilityTypesReverse[r.type]}<br>
            <strong>Desde:</strong> ${fmt(r.timeFrom)}<br>
            <strong>Hasta:</strong> ${fmt(r.timeTo)}<br>
            <strong>Pagado:</strong> ${r.paid ? "Sí" : "No"}
          </p>
        </section>
        <button class="btn p-0 text-danger fs-5 align-self-center"
                title="Eliminar" data-id="${r._id}">
          <i class="bi bi-trash"></i>
        </button>
      </article>`;

        li.querySelector("button").addEventListener("click", async () => {
            if (!confirm("¿Eliminar esta reserva?")) return;
            try {
                await BookingService.deleteById({ _id: r._id }, token);
                li.remove();
                flash("Reserva eliminada correctamente", "success");
            } catch (err) {
                alert("Error al eliminar la reserva.");
                console.error(err);
            }
        });

        listEl.appendChild(li);
    });
}