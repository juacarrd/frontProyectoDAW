import { FacilityTypesReverse } from "./FacilityTypes.js";

export class FacilityDTO {
  constructor({ _id, name, country, state, types = [], latitude, longitude }) {
    this._id       = _id;
    this.name      = name;
    this.country   = country;
    this.state     = state;
    this.latitude  = latitude;
    this.longitude = longitude;

    this.facilityTypes = types.map(
      t => FacilityTypesReverse[t] || `Tipo ${t}`
    );
  }
}
