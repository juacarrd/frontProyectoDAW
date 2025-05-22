import { ensureLoggedIn } from "./authGuard.js";
import { CONFIG } from "../config/config.js";
import { FacilityTypes } from "../modelo/FacilityTypes.js";
import { FacilityService } from "../servicios/FacilityService.js";

/* ─── Seguridad: solo admins ───────────────── */
const user = ensureLoggedIn();   // redirige si no hay sesión
const token = user.token;

if (!user.admin) {
    window.location.href = "mainMenu.html";
}

/* ─── Provincias ───────────────────────────── */
const PROVINCES = [
    "Álava", "Albacete", "Alicante", "Almería", "Asturias", "Ávila",
    "Badajoz", "Barcelona", "Burgos", "Cáceres", "Cádiz", "Cantabria",
    "Castellón", "Ciudad Real", "Córdoba", "Cuenca", "Gerona", "Granada",
    "Guadalajara", "Guipúzcoa", "Huelva", "Huesca", "Islas Baleares",
    "Jaén", "La Coruña", "La Rioja", "Las Palmas", "León", "Lérida",
    "Lugo", "Madrid", "Málaga", "Murcia", "Navarra", "Orense", "Palencia",
    "Pontevedra", "Salamanca", "Santa Cruz de Tenerife", "Segovia",
    "Sevilla", "Soria", "Tarragona", "Teruel", "Toledo", "Valencia",
    "Valladolid", "Vizcaya", "Zamora", "Zaragoza"
];

/* ─── DOM ───────────────────────────────────── */
const selProvince = document.getElementById("selProvince");
const typesContainer = document.getElementById("typesContainer");
const frmFacility = document.getElementById("frmFacility");
const txtName = document.getElementById("txtName");
const inpLat = document.getElementById("lat");
const inpLng = document.getElementById("lng");

/* ─── Logout ───────────────────────────────── */
document.getElementById("btnLogout")?.addEventListener("click", () => {
    localStorage.removeItem("loggedUser");
    window.location.href = "index.html";
});

/* ─── Provincias (Zamora por defecto) ──────── */
PROVINCES.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    if (p === "Zamora") opt.selected = true;
    selProvince.appendChild(opt);
});

/* ─── Etiquetas (tags) de tipos ────────────── */
Object.entries(FacilityTypes).forEach(([name, id]) => {
    const inputId = `type-${id}`;

    // 1. Crear input
    const input = document.createElement("input");
    input.type = "checkbox";
    input.className = "btn-check";
    input.name = "facilityType";
    input.id = inputId;
    input.value = id;
    input.dataset.typeId = id;

    // 2. Crear etiqueta visual
    const label = document.createElement("label");
    label.className = "btn btn-outline-primary rounded-pill px-3 py-2 me-2";
    label.setAttribute("for", inputId);
    label.textContent = name;

    // 3. Añadir al contenedor en orden correcto
    typesContainer.appendChild(input);
    typesContainer.appendChild(label);
});



/* ─── Google Maps con AdvancedMarkerElement ── */
async function loadGoogleMapsApi() {
    if (window.google && google.maps) return;

    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${CONFIG.GOOGLE_MAPS_API_KEY}&libraries=marker&loading=async&callback=initMap`;
        script.async = true;
        script.defer = true;
        script.onerror = reject;
        document.head.appendChild(script);
        window.initMap = () => resolve();
    });
}

let map, marker;

async function setupMap() {
    await loadGoogleMapsApi();

    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 41.52, lng: -5.39 }, // Toro
        zoom: 14,
        mapId: "4504f8b37365c3d0"
    });

    map.addListener("click", ({ latLng }) => {
        if (!marker) {
            marker = new google.maps.marker.AdvancedMarkerElement({
                map,
                position: latLng
            });
        } else {
            marker.position = latLng;
        }

        inpLat.value = latLng.lat();
        inpLng.value = latLng.lng();
    });
}

setupMap().catch(console.error);

/* ─── Enviar formulario ────────────────────── */
frmFacility.addEventListener("submit", async e => {
    e.preventDefault();

    const name = txtName.value.trim();
    const state = selProvince.value;
    const types = [...typesContainer.querySelectorAll("input.btn-check:checked")]
        .map(el => Number(el.dataset.typeId));
    const latitude = parseFloat(inpLat.value);
    const longitude = parseFloat(inpLng.value);

    console.log("Latitude:", latitude);
    console.log("Longitude:", longitude);
    console.log("Tipos seleccionados:", types);


    if (!name || !state || !types.length || isNaN(latitude) || isNaN(longitude)) {
        alert("Por favor, completa todos los campos y selecciona un punto en el mapa.");
        return;
    }

    const payload = {
        name,
        country: "España",   // valor por defecto 
        state,
        types,
        latitude,
        longitude
    };

    try {
        await FacilityService.addFacility(payload, token);
        alert("Instalación creada correctamente.");
        window.location.href = "adminFacilities.html";
    } catch (err) {
        console.error(err);
        alert("Error al crear la instalación. Comprueba la consola.");
    }
});
