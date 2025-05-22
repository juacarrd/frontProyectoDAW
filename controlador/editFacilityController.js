import { ensureLoggedIn } from "./authGuard.js";
import { CONFIG } from "../config/config.js";
import { FacilityTypes } from "../modelo/FacilityTypes.js";
import { FacilityService } from "../servicios/FacilityService.js";

/* Seguridad */
const user = ensureLoggedIn();
const token = user.token;
if (!user.admin) {
    window.location.href = "mainMenu.html";
}

/* Provincias */
const PROVINCES = [
    "Álava", "Albacete", "Alicante", "Almería", "Asturias", "Ávila", "Badajoz", "Barcelona", "Burgos",
    "Cáceres", "Cádiz", "Cantabria", "Castellón", "Ciudad Real", "Córdoba", "Cuenca", "Gerona", "Granada",
    "Guadalajara", "Guipúzcoa", "Huelva", "Huesca", "Islas Baleares", "Jaén", "La Coruña", "La Rioja",
    "Las Palmas", "León", "Lérida", "Lugo", "Madrid", "Málaga", "Murcia", "Navarra", "Orense", "Palencia",
    "Pontevedra", "Salamanca", "Santa Cruz de Tenerife", "Segovia", "Sevilla", "Soria", "Tarragona",
    "Teruel", "Toledo", "Valencia", "Valladolid", "Vizcaya", "Zamora", "Zaragoza"
];

/* DOM */
const selProvince = document.getElementById("selProvince");
const typesContainer = document.getElementById("typesContainer");
const frmFacility = document.getElementById("frmFacility");
const txtName = document.getElementById("txtName");
const inpLat = document.getElementById("lat");
const inpLng = document.getElementById("lng");
const btnSubmit = document.getElementById("btnSubmit");

/* ID */
const params = new URLSearchParams(location.search);
const facilityId = params.get("id");

/* Logout */
document.getElementById("btnLogout")?.addEventListener("click", () => {
    localStorage.removeItem("loggedUser");
    window.location.href = "index.html";
});

/* Render provincias */
function renderProvinces(selectedValue = "Zamora") {
    selProvince.innerHTML = "";
    PROVINCES.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p;
        opt.textContent = p;
        if (p === selectedValue) opt.selected = true;
        selProvince.appendChild(opt);
    });
}

/* Render de tipos */
const renderTypes = (selected = []) => {
    typesContainer.innerHTML = "";
    Object.entries(FacilityTypes).forEach(([name, id]) => {
        const inputId = `type-${id}`;
        const input = document.createElement("input");
        input.type = "checkbox";
        input.className = "btn-check";
        input.name = "facilityType";
        input.id = inputId;
        input.value = id;
        input.dataset.typeId = id;
        input.checked = selected.includes(id);

        const label = document.createElement("label");
        label.className = "btn btn-outline-primary rounded-pill px-3 py-2 me-2";
        label.setAttribute("for", inputId);
        label.textContent = name;

        typesContainer.appendChild(input);
        typesContainer.appendChild(label);
    });
};

/* Google Maps */
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
async function setupMap(lat, lng) {
    await loadGoogleMapsApi();
    const pos = { lat, lng };
    map = new google.maps.Map(document.getElementById("map"), {
        center: pos,
        zoom: 14,
        mapId: "4504f8b37365c3d0"
    });

    marker = new google.maps.marker.AdvancedMarkerElement({ map, position: pos });

    map.addListener("click", ({ latLng }) => {
        marker.position = latLng;
        inpLat.value = latLng.lat();
        inpLng.value = latLng.lng();
    });

    inpLat.value = lat;
    inpLng.value = lng;
}

/* Cargar datos instalación */
FacilityService.getById(facilityId, token)
    .then(res => {
        if (!res?.facility) throw new Error("No encontrada");
        const f = res.facility;

        txtName.value = f.name;
        renderProvinces(f.state);            // ✅ aquí se marca la provincia correctamente
        renderTypes(f.types);
        setupMap(f.latitude, f.longitude);
        btnSubmit.textContent = "Actualizar instalación";
    })
    .catch(err => {
        console.error(err);
        alert("Error al cargar instalación.");
        window.location.href = "adminFacilities.html";
    });

/* Envío */
frmFacility.addEventListener("submit", async e => {
    e.preventDefault();

    const name = txtName.value.trim();
    const state = selProvince.value;
    const types = [...typesContainer.querySelectorAll("input.btn-check:checked")]
        .map(el => Number(el.dataset.typeId));
    const latitude = parseFloat(inpLat.value);
    const longitude = parseFloat(inpLng.value);

    if (!name || !state || !types.length || isNaN(latitude) || isNaN(longitude)) {
        alert("Por favor, completa todos los campos y selecciona un punto en el mapa.");
        return;
    }

    const payload = {
        id: facilityId,
        name,
        country: "España",
        state,
        types,
        latitude,
        longitude
    };

    try {
        await FacilityService.updateFacility(payload, token);
        alert("Instalación actualizada correctamente.");
        window.location.href = "adminFacilities.html";
    } catch (err) {
        console.error(err);
        alert("Error al actualizar la instalación.");
    }
});
