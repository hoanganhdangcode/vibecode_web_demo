export function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

export function formatDistance(km) {
  if (km == null || Number.isNaN(km)) return null
  const meters = km * 1000
  if (meters < 1000) return `~${Math.max(1, Math.round(meters / 10) * 10)}m`
  return `~${km.toFixed(1)}km`
}