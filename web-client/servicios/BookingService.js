// servicios/BookingService.js
// -----------------------------------------------------------------------------
// BookingService
// --------------
// Esta clase encapsula todas las llamadas HTTP relativas a reservas,
// de forma que el resto de la aplicación no conozca detalles de red
// ni endpoints concretos.
//
// • No se escriben direcciones IP aquí: la URL base se obtiene de un único
//   punto de configuración ( ApiService.BASE_URL ) o, si se prefiere, de un
//   módulo de parámetros de entorno que el **ApiService** consuma.
// • Cada método recibe el `token` JWT sin prefijo; ApiService añade
//   «Bearer » si es necesario.
// • Todos los métodos devuelven directamente el objeto que suministra
//   `ApiService.post`, normalmente `json.result`.
//
// Véase ApiService.js para la definición de BASE_URL. :contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1}
// -----------------------------------------------------------------------------

import { ApiService } from "../controlador/ApiService.js";   // punto único de red

export class BookingService {
  /* ------------------------------------------------------------------------- */
  /** Devuelve las franjas ya reservadas para un día y tipo de instalación.     *
   *  @param {object} payload  { dateArr:[Y,M,D], facilityId, typeIdx }         *
   *  @param {string} token    JWT del usuario                                  *
   *  @returns {Promise<{times:number[][]}>} Array de rangos [from,to,userId]   */
  static async getReservedTimes(payload, token) {
    const { dateArr, facilityId, typeIdx } = payload;
    const [y, m, d] = dateArr;
    const from = new Date(y, m, d, 9).getTime();   // 09:00
    const to = new Date(y, m, d, 23).getTime();  // 23:00

    return ApiService.post(
      "/api/booking/getReservedTimes",
      { _id: facilityId, type: typeIdx, from, to },
      token
    );                                             // → { times:[…] }
  }

  /* ------------------------------------------------------------------------- */
  /** Crea una nueva reserva.                                                   *
   *  @param {object} body   Documento Booking                                 *
   *  @param {string} token  JWT                                                */
  static async saveAppointment(body, token) {
    return ApiService.post("/api/booking/newBooking", body, token);
    // → { success:boolean, bookingId?:string, message?:string }
  }

  /* ------------------------------------------------------------------------- */
  /** Devuelve la instalación asociada a una reserva.                           *
   *  @param {string} id      Identificador de instalación                      *
   *  @param {string} token   JWT                                               */
  static async getFacility(id, token) {
    return ApiService.post("/api/facility/getOne", { _id: id }, token);
    // → { facility:{…} }
  }

  /* ------------------------------------------------------------------------- */
  /** Obtiene una reserva por su identificador.                                 *
   *  @param {string} id     Identificador de reserva                           *
   *  @param {string} token  JWT                                                */
  static async getById(id, token) {
    return ApiService.post("/api/booking/getById", { _id: id }, token);
    // → { found:true, booking:{…} }
  }

  /* ------------------------------------------------------------------------- */
  /** Marca o desmarca como pagada una reserva.                                 *
   *  @param {string} id      Identificador de reserva                          *
   *  @param {boolean} paid   Estado de pago                                    *
   *  @param {string} token   JWT                                               */
  static async updatePaidStatus(id, paid, token) {
    return ApiService.post(
      "/api/booking/updatePaidById",
      { _id: id, paid },
      token
    );                                     // → { updated:true }
  }

  /* ------------------------------------------------------------------------- */
  /** Lista todas las reservas futuras de un usuario.                           *
   *  @param {object} criteria { userId, date } – date en ms                    *
   *  @param {string} token    JWT                                              */
  static async getAllByUser(criteria, token) {
    return ApiService.post("/api/booking/getAllByUser", criteria, token);
    // → { bookings:[…] }
  }

  /* ------------------------------------------------------------------------- */
  /** Elimina una reserva.                                                      *
   *  @param {object} body  { _id }                                             *
   *  @param {string} token JWT                                                 */
  static async deleteById(body, token) {
    return ApiService.post("/api/booking/deleteById", body, token);
    // → { deleted:true }
  }

  static async deleteAllByUser(userId, token) {
    return await ApiService.post("/api/booking/deleteByUser", { userId }, token);
  }

  static async getAllByFacility(facilityId, token) {
    return await ApiService.post("/api/booking/getAllByFacility", { facilityId }, token);
    // → { bookings: [...] }
  }

  /* ------------------------------------------------------------------------- */
  /** Devuelve todos los usuarios (usado solo por administradores).            *
   *  @param {string} token  JWT                                               */
  static async getAllUsers(token) {
    return await ApiService.post("/api/user/list", {}, token);
    // → { users: [ { _id, username, email } ] }
  }


}
