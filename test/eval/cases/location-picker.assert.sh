# The bundled template must be used rather than regenerated from scratch.
[ -f "$ws/out/admin/src/components/custom-field/LocationPickerField/tileMath.ts" ] || {
  echo "    tileMath.ts missing — the location-picker template was not used"; exit 1; }

# CSP must gain exactly the tile origin and nothing broader.
mw="$ws/app/config/middlewares.ts"
grep -q 'tile.openstreetmap.org' "$mw" || { echo "    tile origin not added to CSP"; exit 1; }
grep -qE "'https:'" "$mw" && { echo "    a blanket https: source was added"; exit 1; }

# The existing plugin entry must survive.
grep -q 'upload' "$ws/app/config/plugins.ts" || { echo "    existing plugin entry was clobbered"; exit 1; }
grep -q 'location-picker' "$ws/app/config/plugins.ts" || { echo "    plugin was not registered"; exit 1; }

# The unused server surface should be gone (SKILL.md 3a-bis).
[ -d "$ws/out/server/src/routes/content-api" ] && {
  echo "    unused content-api route was left in place"; exit 1; }
exit 0
