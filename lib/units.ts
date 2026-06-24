// Conversion helpers
export const kgToLbs = (kg: number) => Math.round(kg * 2.2046 * 10) / 10;
export const lbsToKg = (lbs: number) => Math.round(lbs / 2.2046 * 10) / 10;
export const cmToFtIn = (cm: number) => {
  const totalIn = cm / 2.54;
  const ft = Math.floor(totalIn / 12);
  const inches = Math.round(totalIn % 12);
  return `${ft}'${inches}"`;
};
export const ftInToCm = (ft: number, inches: number) => Math.round((ft * 12 + inches) * 2.54);
export const kmToMiles = (km: number) => Math.round(km * 0.6214 * 10) / 10;
export const milesToKm = (miles: number) => Math.round(miles * 1.6093 * 10) / 10;

export function displayWeight(kg: number, units: 'metric' | 'imperial') {
  if (units === 'imperial') return `${kgToLbs(kg)} lbs`;
  return `${kg} kg`;
}

export function displayHeight(cm: number, units: 'metric' | 'imperial') {
  if (units === 'imperial') return cmToFtIn(cm);
  return `${cm} cm`;
}

export function weightLabel(units: 'metric' | 'imperial') {
  return units === 'imperial' ? 'lbs' : 'kg';
}

export function weightToKg(val: number, units: 'metric' | 'imperial') {
  return units === 'imperial' ? lbsToKg(val) : val;
}

export function kgToDisplay(kg: number, units: 'metric' | 'imperial') {
  if (units === 'imperial') return Math.round(kgToLbs(kg) * 10) / 10;
  return kg;
}
