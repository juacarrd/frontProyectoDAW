import { ensureLoggedIn } from "./authGuard.js";
import { FacilityService } from "../servicios/FacilityService.js";
import { FacilityDTO } from "../modelo/FacilityDTO.js";
import { CONFIG } from "../config/config.js";

async function loadGoogleMapsApi() {
  if (window.google && google.maps) return;

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${CONFIG.GOOGLE_MAPS_API_KEY}&libraries=marker`;
    script.async = true;
    script.defer = true;

    script.onload = () => resolve();
    script.onerror = reject;

    document.head.appendChild(script);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const user = ensureLoggedIn();
  if (!user) return;

  const grid = document.getElementById("gridFacilities");
  const token = user.token;

  try {
    await loadGoogleMapsApi(); // carga Maps JS API dinámicamente
    const res = await FacilityService.getFacilityList(token);
    const facilities = res.facilityListResult.map(f => new FacilityDTO(f));
    facilities.forEach(f => grid.appendChild(createCard(f)));
  } catch (err) {
    console.error(err);
    grid.innerHTML = `<div class="alert alert-danger">No se pudieron cargar las instalaciones.</div>`;
  }
});

function createCard(fac) {
  const col = document.createElement("div");
  col.className = "col-12 col-md-6 col-lg-4";

  const mapId = `map-${fac._id}`;
  const tags = (fac.facilityTypes || [])
    .map(name => `<span class="badge bg-secondary me-1">${name}</span>`)
    .join(" ");

  col.innerHTML = `
    <div class="card h-100 shadow-sm">
      <div id="${mapId}" class="card-img-top" style="height: 180px;"></div>
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">${fac.name}</h5>
        <p class="card-text text-muted mb-1">${fac.state}, ${fac.country}</p>
        <div class="mb-3">${tags}</div>
        <a href="booking.html?facilityId=${fac._id}"
           class="btn btn-primary mt-auto w-100">
          Reservar
        </a>
      </div>
    </div>`;

  setTimeout(() => initMap(mapId, fac), 0);
  return col;
}

async function initMap(divId, fac) {
  const position = { lat: fac.latitude, lng: fac.longitude };
  const map = new google.maps.Map(document.getElementById(divId), {
    center: position,
    zoom: 16,
    mapId: CONFIG.GOOGLE_MAPS_ID  
  });

const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

const marker = new AdvancedMarkerElement({
  map,
  position,
  title: fac.name,
});

const infoWindow = new google.maps.InfoWindow({
  content: `<strong>${fac.name}</strong><br>${fac.state}, ${fac.country}`,
});

marker.addListener("click", () => {
  infoWindow.open(map, marker);
});
}
