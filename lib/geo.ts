const EARTH_RADIUS_M = 6371000;

export function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const s =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(s));
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatSpeed(metersPerSecond: number | null): string {
  if (metersPerSecond == null || Number.isNaN(metersPerSecond)) return '— km/j';
  const kmh = metersPerSecond * 3.6;
  if (kmh < 1) return 'Berhenti';
  return `${Math.round(kmh)} km/j`;
}

export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 30_000) return 'Baru sahaja';
  if (diff < 60_000) return `${Math.round(diff / 1000)} saat lalu`;
  if (diff < 3_600_000) return `${Math.round(diff / 60_000)} minit lalu`;
  if (diff < 86_400_000) return `${Math.round(diff / 3_600_000)} jam lalu`;
  return `${Math.round(diff / 86_400_000)} hari lalu`;
}

export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}
