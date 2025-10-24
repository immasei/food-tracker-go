// @/utils/distances.tsx
export function kmToLatDelta(km: number) { 
    return km / 111.0; 
}

export function kmToLngDelta(km: number, atLatDeg: number) {
  const rad = (Math.PI / 180) * atLatDeg;
  return km / (111.320 * Math.cos(rad || 0.0001));
}