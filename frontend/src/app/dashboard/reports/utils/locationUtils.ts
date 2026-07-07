/**
 * locationUtils.ts
 * Pure utility functions for location analytics — no side-effects, no React.
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type RawBooking = {
  id: string;
  clientName?: string;
  photographerName?: string;
  date: string;
  eventType: string;
  status: string;
  location?: string;
  locationMapLink?: string;
  city?: string;
  district?: string;
  customer?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
};

export type MapPoint = {
  lat: number;
  lon: number;
  label: string;
  eventType: string;
  date: string;
  district?: string;
  city?: string;
};

export type DistrictStat = {
  district: string;
  count: number;
  eventTypes: Record<string, number>;
};

export type CityStat = {
  city: string;
  count: number;
};

export type LocationInsightsSummary = {
  topDistrict: string | null;
  topCity: string | null;
  totalWithCoords: number;
  totalWithLocation: number;
  totalBookings: number;
  coveragePercent: number;
};

// ── Coordinate Extraction ──────────────────────────────────────────────────────

/**
 * Extracts {lat, lon} from a Google Maps URL.
 * Handles:
 *  - https://www.google.com/maps/@lat,lon,15z
 *  - https://maps.google.com/?q=lat,lon
 */
export function extractCoordsFromMapLink(
  url: string | undefined | null,
): { lat: number; lon: number } | null {
  if (!url) return null;

  // Pattern 1: @lat,lon
  const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lon = parseFloat(atMatch[2]);
    if (!isNaN(lat) && !isNaN(lon)) return { lat, lon };
  }

  // Pattern 2: ?q=lat,lon or &q=lat,lon
  const qMatch = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (qMatch) {
    const lat = parseFloat(qMatch[1]);
    const lon = parseFloat(qMatch[2]);
    if (!isNaN(lat) && !isNaN(lon)) return { lat, lon };
  }

  return null;
}

// ── Aggregation ────────────────────────────────────────────────────────────────

/** Derives map points from bookings that have an extractable locationMapLink. */
export function buildMapPoints(bookings: RawBooking[]): MapPoint[] {
  const points: MapPoint[] = [];
  for (const b of bookings) {
    const coords = extractCoordsFromMapLink(b.locationMapLink);
    if (!coords) continue;
    const clientName = b.customer
      ? `${b.customer.firstName} ${b.customer.lastName}`
      : b.clientName || "Client";
    points.push({
      lat: coords.lat,
      lon: coords.lon,
      label: `${clientName} · ${b.eventType}`,
      eventType: b.eventType || "Other",
      date: b.date,
      district: b.district,
      city: b.city,
    });
  }
  return points;
}

/** Groups bookings by district with per-district event type counts. */
export function buildDistrictStats(bookings: RawBooking[]): DistrictStat[] {
  const map: Record<string, DistrictStat> = {};
  for (const b of bookings) {
    const district = b.district?.trim() || null;
    if (!district) continue;
    if (!map[district]) map[district] = { district, count: 0, eventTypes: {} };
    map[district].count++;
    const et = b.eventType || "Other";
    map[district].eventTypes[et] = (map[district].eventTypes[et] || 0) + 1;
  }
  return Object.values(map).sort((a, b) => b.count - a.count);
}

/** Groups bookings by city and returns sorted list. */
export function buildCityStats(bookings: RawBooking[]): CityStat[] {
  const map: Record<string, number> = {};
  for (const b of bookings) {
    const city = b.city?.trim() || null;
    if (!city) continue;
    map[city] = (map[city] || 0) + 1;
  }
  return Object.entries(map)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count);
}

/** Builds the summary insights object for the LocationInsightsCard. */
export function buildLocationInsights(
  bookings: RawBooking[],
  districtStats: DistrictStat[],
  cityStats: CityStat[],
  mapPoints: MapPoint[],
): LocationInsightsSummary {
  const totalBookings = bookings.length;
  const totalWithLocation = bookings.filter(
    (b) => b.district || b.city || b.location || b.locationMapLink,
  ).length;
  const totalWithCoords = mapPoints.length;
  const coveragePercent =
    totalBookings > 0
      ? Math.round((totalWithLocation / totalBookings) * 100)
      : 0;
  return {
    topDistrict: districtStats[0]?.district ?? null,
    topCity: cityStats[0]?.city ?? null,
    totalWithCoords,
    totalWithLocation,
    totalBookings,
    coveragePercent,
  };
}

/** Returns all unique event types across a set of bookings. */
export function getUniqueEventTypes(bookings: RawBooking[]): string[] {
  const set = new Set<string>();
  for (const b of bookings) {
    if (b.eventType) set.add(b.eventType);
  }
  return Array.from(set).sort();
}
