/**
 * ApiService
 * ----------
 *  – Centraliza la URL base del backend.
 *  – Añade el prefijo “Bearer ” al JWT solo cuando falta.
 *  – Devuelve   json.result  si existe (compatibilidad con código
 *    anterior) o, en su defecto, el JSON completo.
 */
export class ApiService {
  /** Cambia la IP/puerto aquí si el backend se mueve. */
  static BASE_URL = "http://35.178.200.121";

  /* ------------------------------------------------------------ */
  /** Construye las cabeceras correctamente formateadas. */
  static buildHeaders(token = "") {
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers.Authorization = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;
    }
    return headers;
  }

  /* ------------------------------------------------------------ */
  /** Petición POST genérica; devuelve json.result || json. */
  static async post(endpoint, body = {}, token = "") {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${this.BASE_URL}${endpoint}`;

    const res = await fetch(url, {
      method : "POST",
      headers: this.buildHeaders(token),
      body   : JSON.stringify(body)
    });

    if (!res.ok) {
      // Texto entero para saber qué devuelve el backend ante un error
      const txt = await res.text();
      throw new Error(`[POST ${url}] ${res.status} – ${txt}`);
    }

    const json = await res.json();
    return json.result ?? json;          // ← MISMA firma que tenías antes
  }
}
