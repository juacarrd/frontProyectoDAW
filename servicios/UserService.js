import { ApiService } from "../controlador/ApiService.js";

export class UserService {
  static async login(email, password) {
    // devuelve {success, successData, error}
    return await ApiService.post("/api/user/login", { email, password });
  }

  static async signup(email, username, password) {
    return await ApiService.post("/api/user/signup", { email, username, password });
  }

  static async loginGoogle(id_token) {
    return await ApiService.post("/api/user/googleLogin", { id_token });
  }


  static async deleteAccount(userId, token) {
    return await ApiService.post("/api/user/delete", { _id: userId }, token);
  }

  static async getAll(token) {
    return ApiService.post("/api/user/list", {}, token);   // { users:[…] }
  }

}
