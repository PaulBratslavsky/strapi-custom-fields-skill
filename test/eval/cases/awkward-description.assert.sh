[ -f "$ws/out/package.json" ] || {
  echo "    no package.json was generated (did the agent stop to ask? see transcript)"; exit 1; }
node -e "JSON.parse(require('fs').readFileSync('$ws/out/package.json','utf8'))" 2>/dev/null || {
  echo "    package.json is not valid JSON"; exit 1; }
