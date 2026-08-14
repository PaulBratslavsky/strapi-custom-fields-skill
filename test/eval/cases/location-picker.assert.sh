# The bundled template must be used rather than regenerated from scratch.
[ -f "$ws/out/admin/src/components/custom-field/LocationPickerField/tileMath.ts" ] || {
  echo "    tileMath.ts missing — the location-picker template was not used"; exit 1; }

# CSP must gain the tile origin and nothing broader.
mw="$ws/app/config/middlewares.ts"
grep -q 'tile.openstreetmap.org' "$mw" || { echo "    tile origin not added to CSP"; exit 1; }
grep -qE "'https:'" "$mw" && { echo "    a blanket https: source was added"; exit 1; }

grep -q 'location-picker' "$ws/app/config/plugins.ts" || { echo "    plugin not registered"; exit 1; }

# The unused server surface should be gone (SKILL.md Step 3a-bis).
[ -d "$ws/out/server/src/routes/content-api" ] && {
  echo "    unused content-api route was left in place"; exit 1; }

# --- the part a stub app could never check: does Strapi actually boot with it ---
( cd "$ws/out" && npm install --silent && npm run typecheck && npm run build ) > "$dir/plugin-build.log" 2>&1 || {
  echo "    plugin failed to install/typecheck/build — see plugin-build.log"; exit 1; }

( cd "$ws/app" && npm run develop ) > "$dir/strapi-boot.log" 2>&1 &
boot_pid=$!
for _ in $(seq 1 60); do
  grep -qE 'administration panel at|Welcome back' "$dir/strapi-boot.log" 2>/dev/null && break
  grep -qE 'TypeScript compilation failed|Error during development' "$dir/strapi-boot.log" 2>/dev/null && break
  sleep 5
done

booted=0
grep -qE 'administration panel at|Welcome back' "$dir/strapi-boot.log" 2>/dev/null && booted=1
kill "$boot_pid" 2>/dev/null
pkill -f "$ws/app" 2>/dev/null

[ "$booted" = "1" ] || {
  echo "    Strapi did not boot with the plugin — see strapi-boot.log"; exit 1; }
exit 0
