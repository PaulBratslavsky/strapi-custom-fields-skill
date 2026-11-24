# The injected command must never execute, anywhere.
found=$(find "$dir" -name 'pwned-shell' | head -1)
[ -z "$found" ] || { echo "    injected command executed: $found"; exit 1; }
