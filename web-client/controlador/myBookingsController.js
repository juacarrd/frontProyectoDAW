import { ensureLoggedIn } from "./authGuard.js";
import { BookingService } from "../servicios/BookingService.js";
import { FacilityTypesReverse } from "../modelo/FacilityTypes.js";

const user = ensureLoggedIn();
const token = user.token;

const listEl = document.getElementById("bookingsList");
const emptyEl = document.getElementById("emptyNotice");
const orderSel = document.getElementById("orderBy");
let cache = [];

orderSel.addEventListener("change", () => sortAndRender(cache, orderSel.value));

document.addEventListener("DOMContentLoaded", async () => {
  const { bookings = [] } = await BookingService.getAllByUser(
    { userId: user._id, date: Date.now() },
    token
  );
  cache = bookings;
  sortAndRender(bookings, orderSel.value);
});

function typeName(index) {
  return FacilityTypesReverse[index] ?? `Tipo ${index}`;
}

function fmt(ts) {
  return new Date(ts).toLocaleString("es-ES");
}

function sortAndRender(arr, criterion) {
  const sorted = [...arr];
  if (criterion === "type") {
    sorted.sort((a, b) => typeName(a.type).localeCompare(typeName(b.type)));
  } else {
    sorted.sort((a, b) => new Date(a.timeFrom) - new Date(b.timeFrom));
  }
  render(sorted);
}

function render(bookings) {
  listEl.innerHTML = "";
  if (!bookings.length) {
    emptyEl.classList.remove("d-none");
    return;
  }
  emptyEl.classList.add("d-none");

  bookings.forEach(b => {
    const li = document.createElement("li");
    li.className = "list-group-item";
    li.innerHTML = `
      <article class="d-flex justify-content-between flex-wrap gap-3">
        <section class="flex-grow-1">
          <h2 class="h6 mb-1">${b.facilityName}</h2>
          <p class="mb-1">
            <strong>Tipo:</strong> ${typeName(b.type)}<br>
            <strong>Desde:</strong> ${fmt(b.timeFrom)}<br>
            <strong>Hasta:</strong> ${fmt(b.timeTo)}<br>
            <strong>Pagado:</strong> ${b.paid ? "Sí" : "No"}
          </p>
        </section>
        <nav class="d-flex align-items-center gap-3">
          <a class="text-primary fs-5" href="bookingDetail.html?id=${b._id}" title="Ver">
            <i class="bi bi-eye"></i>
          </a>
          <button class="btn p-0 text-danger fs-5" title="Eliminar" data-id="${b._id}">
            <i class="bi bi-trash"></i>
          </button>
        </nav>
      </article>
    `;

    li.querySelector("button").addEventListener("click", async () => {
      if (!confirm("¿Eliminar esta reserva?")) return;
      await BookingService.deleteById({ _id: b._id }, token);
      cache = cache.filter(x => x._id !== b._id);
      sortAndRender(cache, orderSel.value);
    });

    listEl.appendChild(li);
  });
}
