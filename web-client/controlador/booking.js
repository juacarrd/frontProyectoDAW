import { ensureLoggedIn } from "./authGuard.js";
import { FacilityService } from "../servicios/FacilityService.js";
import { BookingService } from "../servicios/BookingService.js";
import { FacilityDTO } from "../modelo/FacilityDTO.js";
import { CONFIG } from "../config/config.js";

/* ───── Sesión y datos instalación ───── */
const user = ensureLoggedIn();
const token = user.token;
const facilityId = new URLSearchParams(location.search).get("facilityId");
if (!facilityId) { alert("Instalación no especificada"); location.href = "mainMenu.html"; }

const { facility } = await FacilityService.getOne(facilityId, token);
const fac = new FacilityDTO(facility);

/* ───── DOM ───── */
const fldName = document.getElementById("facilityName");
const fldLoc = document.getElementById("facilityLocation");
const fldMap = document.getElementById("facilityMap");
const typesBox = document.getElementById("typesContainer");
const dateInput = document.getElementById("inputDate");
const selFrom = document.getElementById("selectFrom");
const selTo = document.getElementById("selectTo");
const btnSave = document.getElementById("btnSave");
const routeInfo = document.getElementById("routeInfo");

/* ───── Rellenar cabecera instalación ── */
fldName.textContent = fac.name;
fldLoc.textContent = `${fac.state}, ${fac.country}`;

/* Tipos actividad */
fac.facilityTypes.forEach((n, i) => {
    typesBox.insertAdjacentHTML("beforeend",
        `<input type="radio" class="btn-check" name="type" id="t${i}" value="${i}">
    <label class="btn btn-outline-secondary" for="t${i}">${n}</label>`);
});

/* ───── Google Maps ───── */
let map, markerOrig, markerDest, dirRenderer;
let travelMode = "WALKING";

await loadMaps();
initMap();

/* carga asincrónica */
async function loadMaps() {
    if (window.google && google.maps) return;
    await new Promise((ok, ko) => {
        const s = document.createElement("script");
        s.src = `https://maps.googleapis.com/maps/api/js?key=${CONFIG.GOOGLE_MAPS_API_KEY}&libraries=marker`;
        s.async = true; s.defer = true; s.onload = ok; s.onerror = ko; document.head.appendChild(s);
    });
}

/* inicializar mapa, marcadores y 1ª ruta */
async function initMap() {
    const dest = { lat: fac.latitude, lng: fac.longitude };
    map = new google.maps.Map(fldMap, { center: dest, zoom: 15, mapId: CONFIG.GOOGLE_MAPS_ID });

    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    markerDest = new AdvancedMarkerElement({ map, position: dest, title: fac.name });
    dirRenderer = new google.maps.DirectionsRenderer({ map });

    navigator.geolocation.getCurrentPosition(pos => {
        const orig = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        markerOrig = new AdvancedMarkerElement({ map, position: orig, title: "Tu ubicación" });
        drawRoute(orig, dest);
    });
}

/* dibuja ruta del modo activo y muestra distancia+tiempo */
function drawRoute(orig, dest) {
    new google.maps.DirectionsService().route({
        origin: orig, destination: dest,
        travelMode: google.maps.TravelMode[travelMode],
        ...(travelMode === "DRIVING" ? { drivingOptions: { departureTime: new Date() } } : {})
    }, (res, stat) => {
        if (stat === "OK") {
            dirRenderer.setDirections(res);
            const leg = res.routes[0].legs[0];
            document.getElementById("routeText").textContent = `${leg.distance.text} - ${leg.duration.text}`;

        }
    });
}

/* cambiar modo seleccionado */
document.querySelectorAll('input[name="travelMode"]').forEach(r => {
    r.addEventListener("change", () => {
        travelMode = r.value;
        if (markerOrig && markerDest) drawRoute(markerOrig.position.toJSON(), markerDest.position.toJSON());
    });
});

/* ───── Flatpickr & disponibilidad ───── */
flatpickr(dateInput, { dateFormat: "d/m/Y", minDate: "today", disableMobile: true, onChange: checkAvailability });
typesBox.addEventListener("change", checkAvailability);

selFrom.addEventListener("change", () => {
    const h0 = +selFrom.value, hMax = Math.min(h0 + 3, 22);
    selTo.innerHTML = Array.from({ length: hMax - h0 }, (_, i) => `<option>${h0 + i + 1}</option>`).join("");
    selTo.disabled = false; validateForm();
});
selTo.addEventListener("change", validateForm);

/* disponibilidad horaria */
async function checkAvailability() {
    if (!dateInput.value) return;
    const radio = document.querySelector("input[name='type']:checked");
    if (!radio) return;

    const [d, m, y] = dateInput.value.split("/").map(Number);
    const { times } = await BookingService.getReservedTimes({
        dateArr: [y, m - 1, d], facilityId, typeIdx: +radio.value, userId: user._id
    }, token);

    const hours = Array.from({ length: 13 }, (_, i) => 9 + i);
    const now = new Date(), today = y === now.getFullYear() && m === now.getMonth() + 1 && d === now.getDate();
    let free = today ? hours.filter(h => h > now.getHours()) : hours.slice();

    const busy = new Set();
    times.forEach(([s, e]) => {
        for (let h = new Date(s).getHours(); h < new Date(e).getHours(); h++) busy.add(h);
    });
    free = free.filter(h => !busy.has(h));
    if (free.at(-1) === 21) free.pop();                 // necesita 1 h libre final

    const valid = free.filter(h => free.includes(h + 1));
    selFrom.innerHTML = valid.map(h => `<option>${h}</option>`).join("");
    selFrom.disabled = !valid.length; selTo.innerHTML = ""; selTo.disabled = true;
    if (valid.length) { selFrom.value = valid[0]; selFrom.dispatchEvent(new Event("change")); }

    const warn = document.getElementById("reservedNotice") || (() => { const d = document.createElement("div"); d.id = "reservedNotice"; d.className = "alert alert-warning mt-3"; btnSave.parentElement.appendChild(d); return d })();
    warn.textContent = valid.length ? "" : "No hay franjas horarias disponibles.";
    if (valid.length) warn.remove(); validateForm();
}

/* validación */
function validateForm() { btnSave.disabled = !(dateInput.value && document.querySelector("input[name='type']:checked") && selFrom.value && selTo.value); }

/* ───── Envío reserva ───── */
document.getElementById("bookingForm").addEventListener("submit", async e => {
    e.preventDefault();
    const [d, m, y] = dateInput.value.split("/").map(Number);
    const body = {
        userId: user._id, facilityId, facilityName: fac.name,
        type: +document.querySelector("input[name='type']:checked").value,
        timeFrom: new Date(y, m - 1, d, +selFrom.value).getTime(),
        timeTo: new Date(y, m - 1, d, +selTo.value).getTime(),
        paid: false
    };
    const { success, bookingId, message } = await BookingService.saveAppointment(body, token);
    if (!success) return alert(message || "No se pudo guardar");
    alert("Reserva guardada"); location.href = `bookingDetail.html?id=${bookingId}`;
});
