// controlador/BookingDetailController.js
// ------------------------------------------------------------
// Muestra el detalle de una reserva. Si no ha sido pagada,
// integra directamente el botón de pago de PayPal.
// Genera dinámicamente un QR a partir del UID de la reserva.
// ------------------------------------------------------------

import { ensureLoggedIn } from "./authGuard.js";
import { BookingService } from "../servicios/BookingService.js";
import { FacilityService } from "../servicios/FacilityService.js";
import { FacilityDTO } from "../modelo/FacilityDTO.js";
import { CONFIG } from "../config/config.js";

/* ─────────── Contexto de sesión y parámetros ─────────── */
const user      = ensureLoggedIn();
const token     = user.token;
const params    = new URLSearchParams(location.search);
const bookingId = params.get("id");

if (!bookingId) {
  alert("Reserva no especificada");
  location.href = "mainMenu.html";
}

/* ─────────── Referencias a elementos del DOM ─────────── */
const facilityName = document.getElementById("facilityName");
const facilityType = document.getElementById("facilityType");
const bookingDate  = document.getElementById("bookingDate");
const timeFrom     = document.getElementById("timeFrom");
const timeTo       = document.getElementById("timeTo");
const paidStatus   = document.getElementById("paidStatus");
const btnPay       = document.getElementById("btnPay");
const canvas       = document.getElementById("qrCanvas");

/* ─────────── Carga inicial de datos ─────────── */
loadBooking();

async function loadBooking() {
  try {
    const res = await BookingService.getById(bookingId, token);
    const booking =
      res?.booking ??
      res?.result?.booking ??
      null;

    if (!booking) throw new Error("No se encontró la reserva");

    // Traducción del tipo de instalación
    let typeName = `Tipo ${booking.type}`;
    try {
      const { facility } = await FacilityService.getOne(booking.facility, token);
      const facDTO = new FacilityDTO(facility);
      typeName = facDTO.facilityTypes?.[booking.type] ?? typeName;
    } catch (e) {
      console.warn("No se pudo resolver el nombre del tipo de instalación:", e);
    }

    // Presentación de datos
    const fromDate = new Date(booking.timeFrom);
    const toDate   = new Date(booking.timeTo);

    facilityName.textContent = booking.facilityName;
    facilityType.textContent = typeName;
    bookingDate.textContent  = fromDate.toLocaleDateString();
    timeFrom.textContent     = fromDate.getHours() + ":00";
    timeTo.textContent       = toDate.getHours() + ":00";
    paidStatus.textContent   = booking.paid ? "Sí" : "No";

    // ───── Generar QR dinámicamente desde UID ─────
    if (canvas) {
      try {
        const qr = new QRious({
          value: booking.uid,
          size: 220,
        });

        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0);
        img.src = qr.toDataURL();
        canvas.classList.remove("d-none");
      } catch (err) {
        console.error("Error al generar/mostrar el QR:", err);
      }
    }

    // PayPal
    const paypalContainer = document.createElement("div");
    paypalContainer.id = "paypal-button-container";
    btnPay.insertAdjacentElement("afterend", paypalContainer);

    if (booking.paid) {
      btnPay.disabled = true;
      btnPay.classList.add("btn-secondary");
      btnPay.textContent = "Pagado";
      btnPay.title = "El pago ya ha sido realizado";
    } else {
      btnPay.style.display = "none";
      renderPayPalButton(booking);
    }

  } catch (err) {
    console.error(err);
    alert(err.message || "Error al cargar la reserva");
    location.href = "mainMenu.html";
  }
}

/**
 * Renderiza el botón de pago de PayPal y gestiona el proceso.
 */
async function renderPayPalButton(booking) {
  const price = 5.00;

  if (!window.paypal) {
    alert("El servicio de PayPal no se ha cargado correctamente.");
    return;
  }

  paypal.Buttons({
    createOrder: (data, actions) => {
      return actions.order.create({
        purchase_units: [{
          amount: { value: price.toFixed(2) },
          description: `Reserva: ${booking.facilityName}`
        }]
      });
    },
    onApprove: async (data, actions) => {
      await actions.order.capture();
      try {
        await BookingService.updatePaidStatus(bookingId, true, token);
        alert("Pago realizado correctamente.");
        location.reload();
      } catch (e) {
        console.error("Error al actualizar el estado de pago:", e);
        alert("El pago se realizó, pero no se pudo actualizar el estado.");
      }
    },
    onError: err => {
      console.error("Error en PayPal:", err);
      alert("Hubo un error al procesar el pago con PayPal.");
    }
  }).render("#paypal-button-container");
}
