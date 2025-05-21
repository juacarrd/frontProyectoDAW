export const FacilityTypes = {
    Fútbol: 0,
    Baloncesto: 1,
    Balonvolea: 2,
    Badminton: 3,
    Tenis: 4
};

export const FacilityTypesReverse = Object.fromEntries(
    Object.entries(FacilityTypes).map(([k, v]) => [v, k])
);

export function isValidFacilityType(value) {
    return Object.values(FacilityTypes).includes(value);
}
