import { FacilityTypesReverse, FacilityTypes, isValidFacilityType } from "./FacilityTypes.js";

export class BookingDTO {
    constructor({_id, userId, facilityId, facilityName, type, date, timeFrom, timeTo, paid}) {
        this._id = _id;
        this.userId = userId;
        this.facilityId = facilityId;
        this.facilityName = facilityName;
        this.type = FacilityTypesReverse[type];
        this.date = date; // [YYYY, MM, DD]
        this.timeFrom = timeFrom;
        this.timeTo = timeTo;
        this.paid = paid;
    }

    toJSON() {
        return {
            _id: this._id,
            userId: this.userId,
            facilityId: this.facilityId,
            facilityName: this.facilityName,
            type: FacilityTypes[this.type],
            date: this.date,
            timeFrom: this.timeFrom,
            timeTo: this.timeTo,
            paid: this.paid
        };
    }

    static isValid(data) {
        return (
            typeof data.userId === "string" &&
            typeof data.facilityId === "string" &&
            typeof data.facilityName === "string" &&
            isValidFacilityType(data.type) &&
            Array.isArray(data.date) && data.date.length === 3 &&
            data.date.every(d => Number.isInteger(d)) &&
            Number.isInteger(data.timeFrom) &&
            Number.isInteger(data.timeTo) &&
            typeof data.paid === "boolean"
        );
    }
}
