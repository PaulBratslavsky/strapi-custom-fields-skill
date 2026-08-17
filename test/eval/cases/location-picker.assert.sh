# The bundled template must be used rather than regenerated from scratch.
[ -f "$ws/out/admin/src/components/custom-field/LocationPickerField/tileMath.ts" ] || {
  echo "    tileMath.ts missing — the location-picker template was not used"; exit 1; }

# --- CSP: check the effective img-src value, not just that a string appears ---
mw="$ws/app/config/middlewares.ts"
img_src=$(node -e "
  const s = require('fs').readFileSync('$mw','utf8');
  const m = s.match(/'img-src'\s*:\s*\[([^\]]*)\]/) || s.match(/\"img-src\"\s*:\s*\[([^\]]*)\]/);
  if (!m) { console.log('MISSING'); process.exit(0); }
  console.log(m[1].split(',').map(x => x.trim().replace(/^['\"]|['\"]\$/g,'')).filter(Boolean).join('\n'));
")
[ "$img_src" = "MISSING" ] && { echo "    no img-src directive was configured"; exit 1; }
echo "$img_src" | grep -qx 'https://tile.openstreetmap.org' || {
  echo "    img-src does not contain the exact tile origin:"; echo "$img_src" | sed 's/^/      /'; exit 1; }
# No broad source may appear in any directive, in any quote style.
grep -qE "[\"']https:[\"']|\*\." "$mw" && { echo "    a wildcard or bare-scheme source was added to the CSP"; exit 1; }

# --- Plugin registration must actually resolve the generated plugin ---
node -e "
  const s = require('fs').readFileSync('$ws/app/config/plugins.ts','utf8')
    .replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*\$/gm,'');
  const has = /['\"]location-picker['\"]\s*:\s*\{[^}]*resolve\s*:/.test(s);
  if (!has) { console.error('no resolving entry for location-picker'); process.exit(1); }
" || { echo "    config/plugins.ts has no real resolving entry (a comment does not count)"; exit 1; }

# The unused server surface should be gone (SKILL.md Step 3a-bis).
[ -d "$ws/out/server/src/routes/content-api" ] && {
  echo "    unused content-api route was left in place"; exit 1; }

# --- The part a stub app could never check: does Strapi actually boot? ---
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
