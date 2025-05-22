import { ApiService } from "../controlador/ApiService.js";

export class FacilityService {
  /** Lista completa de instalaciones */
  static async getFacilityList(token) {
    const body = { sender: "web-client" };
    return await ApiService.post("/api/facility/list", body, token);
  }

  /** Una instalación por ID */
  static async getOne(id, token) {
    return await ApiService.post("/api/facility/getById", { id }, token);
  }

  /* Borra una instalación */
  static async deleteFacility(id, token) {
    return ApiService.post("/api/facility/delete", { id }, token);
  }

  /* Añade una instalación */
  static async addFacility(body, token) {
    return await ApiService.post("/api/facility/add", body, token);
  }

  /* Actualiza una instalación */
  static async updateFacility(facility, token) {
    return ApiService.post("/api/facility/update", facility, token);
  }

  static async getById(id, token) {
    return await ApiService.post("/api/facility/getById", { id }, token);
  }

}
