/**
 * Web Mercator helpers for the slippy map used by the Location Picker.
 *
 * Positions are expressed in "tile units" for a given zoom level: the world is
 * 2^zoom tiles wide and tall, and every tile is TILE_SIZE pixels square. Tile
 * unit (0, 0) is the north-west corner of the world.
 */

export const TILE_SIZE = 256;
export const MIN_ZOOM = 1;
export const MAX_ZOOM = 18;

/** Web Mercator cannot represent latitudes beyond this. */
export const MAX_MERCATOR_LAT = 85.05112878;

/**
 * Tile origin. A fixed constant — never built from stored values or editor
 * input. The Strapi app's CSP `img-src` must allow this exact origin.
 */
const TILE_ORIGIN = 'https://tile.openstreetmap.org';

export interface LatLng {
  lat: number;
  lng: number;
}

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/** Normalises any longitude into the [-180, 180) range. */
export const wrapLng = (lng: number) => (((((lng + 180) % 360) + 360) % 360) - 180);

/** ~0.1 m of precision — plenty for a map pin, and keeps stored JSON small. */
export const roundCoordinate = (value: number) => Math.round(value * 1e6) / 1e6;

export const tileCount = (zoom: number) => 2 ** zoom;

export const lngToTileX = (lng: number, zoom: number) =>
  ((lng + 180) / 360) * tileCount(zoom);

export const latToTileY = (lat: number, zoom: number) => {
  const rad = (clamp(lat, -MAX_MERCATOR_LAT, MAX_MERCATOR_LAT) * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * tileCount(zoom);
};

export const tileXToLng = (x: number, zoom: number) => (x / tileCount(zoom)) * 360 - 180;

export const tileYToLat = (y: number, zoom: number) => {
  const n = Math.PI - 2 * Math.PI * (y / tileCount(zoom));
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
};

/**
 * Builds a tile URL from integer tile coordinates only. Values are coerced and
 * bounds-checked so nothing but `<origin>/<z>/<x>/<y>.png` can ever be produced.
 */
export const buildTileUrl = (x: number, y: number, zoom: number) => {
  const z = clamp(Math.floor(zoom), MIN_ZOOM, MAX_ZOOM);
  const max = tileCount(z) - 1;
  const tileX = clamp(Math.floor(x), 0, max);
  const tileY = clamp(Math.floor(y), 0, max);

  return `${TILE_ORIGIN}/${z}/${tileX}/${tileY}.png`;
};

const isValidLat = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= -90 && value <= 90;

const isValidLng = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= -180 && value <= 180;

/**
 * Reads the stored field value. A JSON custom field can hand back either a
 * parsed object or the raw JSON string, and the value may have been written by
 * the Content API rather than this input — so nothing is trusted.
 */
export const parseValue = (value: unknown): LatLng | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  let candidate: unknown = value;

  if (typeof candidate === 'string') {
    try {
      candidate = JSON.parse(candidate);
    } catch {
      return null;
    }
  }

  if (typeof candidate !== 'object' || candidate === null) {
    return null;
  }

  const { lat, lng } = candidate as Record<string, unknown>;

  return isValidLat(lat) && isValidLng(lng) ? { lat, lng } : null;
};

export const formatLatLng = ({ lat, lng }: LatLng) => `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
