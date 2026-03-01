#!/usr/bin/env bash
# Scaffold a Strapi plugin non-interactively using expect.
# Usage: ./scaffold-plugin.sh <output-path> <plugin-name> <display-name> <description>
#
# Accepts Enter (defaults) for: plugin id, author name, author email, git url, license
# Always answers Yes to: admin panel, server, editorconfig, ESLint, Prettier, TypeScript

set -euo pipefail

OUTPUT_PATH="${1:?Usage: scaffold-plugin.sh <output-path> <plugin-name> <display-name> <description>}"
PLUGIN_NAME="${2:?Missing plugin name}"
DISPLAY_NAME="${3:?Missing display name}"
DESCRIPTION="${4:?Missing description}"

if ! command -v expect &>/dev/null; then
  echo "Error: 'expect' is required but not installed." >&2
  exit 1
fi

# Determine package manager flag
PKG_FLAG="--use-npm"
if command -v yarn &>/dev/null && [ -f "$(dirname "$OUTPUT_PATH")/yarn.lock" ] 2>/dev/null; then
  PKG_FLAG="--use-yarn"
fi

script -q /dev/null expect -c "
set timeout 120
spawn npx @strapi/sdk-plugin@latest init $OUTPUT_PATH $PKG_FLAG --no-install
expect \"plugin name\"
send \"$PLUGIN_NAME\r\"
expect \"plugin id\"
send \"\r\"
expect \"display name\"
send \"$DISPLAY_NAME\r\"
expect \"description\"
send \"$DESCRIPTION\r\"
expect \"author name\"
send \"\r\"
expect \"author email\"
send \"\r\"
expect \"git url\"
send \"\r\"
expect \"license\"
send \"\r\"
expect \"register with the admin\"
send \"y\r\"
expect \"register with the server\"
send \"y\r\"
expect \"editorconfig\"
send \"y\r\"
expect \"ESLint\"
send \"y\r\"
expect \"Prettier\"
send \"y\r\"
expect \"TypeScript\"
send \"y\r\"
expect eof
"

# Verify scaffold succeeded
if [ ! -f "$OUTPUT_PATH/package.json" ]; then
  echo "Error: Scaffold failed — no package.json found at $OUTPUT_PATH" >&2
  exit 1
fi

echo ""
echo "Plugin scaffolded successfully at: $OUTPUT_PATH"
