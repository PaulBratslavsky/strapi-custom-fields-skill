node -e "JSON.parse(require('fs').readFileSync('$ws/out/package.json','utf8'))" || {
  echo "    package.json is not valid JSON"; exit 1; }
