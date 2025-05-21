export class LoggedUserDTO {
  constructor({ _id, email, username, token, admin }) {
    this._id        = _id;
    this.email      = email;
    this.displayName = username; // tu API lo llama username
    this.token      = token;
    this.admin      = admin;
  }
  toJSON() {                       // para guardar en localStorage
    return {
      _id: this._id,
      email: this.email,
      username: this.displayName,
      token: this.token,
      admin: this.admin
    };
  }
  static isValid(data) {
    return data && typeof data._id === "string" && typeof data.token === "string";
  }
}
