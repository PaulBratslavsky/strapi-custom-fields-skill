# Location Picker Template

A working map location picker: an interactive slippy map the editor pans, zooms,
and clicks to drop a pin, plus latitude/longitude number inputs that stay in sync
with it. Stores `{ "lat": number, "lng": number }` as a `json` value.

- **Field type:** `json`
- **Use case:** Store locations, venue addresses, delivery points — the most
  complex of the bundled examples, and the reference for building a field that
  loads external resources

## Why this template exists

This is the "complex end" of the template set. Generating a map field from
scratch produces several hundred lines of tile math and pointer handling that
nobody reviews, and a different implementation every time. Start here instead
and change what you need.

## What it does

- Web Mercator slippy map rendered from plain `<img>` tiles — **no third-party
  JavaScript**, no Leaflet or Mapbox SDK, nothing to add to `script-src`
- Pan by drag, zoom by buttons, click to place a pin, arrow keys to pan
- Click-vs-drag detection so a small pointer movement still registers as a pick
- Lat/lng `NumberInput`s for exact entry, kept in sync with the map
- Clear button to reset the field to `null`

## Two files, not one

Unlike the other templates, this one has a `component/` directory with two
files. Copy **both** into the component directory:

```
component/LocationPickerField.tsx  →  admin/src/components/custom-field/<ComponentName>/index.tsx
component/tileMath.ts              →  admin/src/components/custom-field/<ComponentName>/tileMath.ts
```

`tileMath.ts` contains no plugin-specific names and is copied verbatim.

## Required CSP change

The map loads tiles from OpenStreetMap, so the Strapi app's
`config/middlewares.ts` needs one extra `img-src` entry and nothing else:

```typescript
'img-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', 'https://tile.openstreetmap.org'],
```

Do not widen any other directive. There are no iframes, no scripts, and no
`fetch` calls, so `frame-src`, `script-src`, and `connect-src` stay untouched.

**If you switch tile providers**, change `TILE_ORIGIN` in `tileMath.ts` and the
`img-src` entry together, and check the provider's usage policy — OpenStreetMap's
tile server is not intended for heavy production traffic.

## Safety notes

- `buildTileUrl` floors and bounds-checks every coordinate, so only
  `<origin>/<z>/<x>/<y>.png` can be produced — the URL is never assembled from a
  stored value
- `parseValue` treats the stored value as untrusted: it accepts an object or a
  JSON string, range-checks lat/lng, and returns `null` on anything else. A
  value written through the Content API cannot break the input
- The admin input is UI only. The `json` type accepts any shape server-side, so
  add content-type validation if you need the coordinates guaranteed

Placeholders: `{{FIELD_NAME}}`, `{{PLUGIN_ID}}`, `{{DISPLAY_NAME}}`, `{{DESCRIPTION}}`, `{{ICON_NAME}}`, `{{COMPONENT_NAME}}`
