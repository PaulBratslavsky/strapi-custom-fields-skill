#!/usr/bin/env bash
#
# End-to-end evaluation: run the skill for real against a set of fixture
# prompts, then assert on what landed on disk.
#
# The static suite (`npm test`) checks the templates. This checks the *skill* —
# the parts of SKILL.md that only an agent executing it can exercise: the Step 1b
# identifier rules, the overwrite check, the confirmation gates.
#
# Slow (minutes per case), non-deterministic, and costs API tokens, so it is not
# part of `npm test`. Run it before a release or after editing SKILL.md.
#
#   ./run.sh              # all cases
#   ./run.sh traversal    # one case
#
# Requires: the `claude` CLI on PATH.

set -uo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$HERE/../.." && pwd)"
WORK="${EVAL_WORKDIR:-$HERE/.work}"
CASES_DIR="$HERE/cases"

pass=0
fail=0

# A canary path that no case should ever touch.
run_case() {
  local case_name="$1"
  local prompt_file="$CASES_DIR/$case_name.prompt.txt"
  local assert_file="$CASES_DIR/$case_name.assert.sh"

  [ -f "$prompt_file" ] || { echo "no prompt for case '$case_name'"; return 1; }

  local dir="$WORK/$case_name"
  local ws="$dir/workspace"

  rm -rf "$dir"
  mkdir -p "$ws/out" "$ws/.claude/skills"

  # Install the WORKING TREE as the skill, so the eval tests your edits rather
  # than whatever happens to be in ~/.claude/skills.
  mkdir -p "$ws/.claude/skills/strapi-custom-field"
  (cd "$REPO" && tar --exclude=.git --exclude=test -cf - .) \
    | (cd "$ws/.claude/skills/strapi-custom-field" && tar -xf -)

  echo "DO-NOT-TOUCH" > "$dir/canary.txt"

  # Cases marked `.needs-app` get a REAL Strapi app, scaffolded once and cached.
  # A stub config directory cannot load a plugin, so it cannot tell you whether
  # the plugin registers, renders, or persists — only a real app can.
  if [ -f "$CASES_DIR/$case_name.needs-app" ]; then
    local src
    src="$("$HERE/make-app.sh")"
    echo "  copying real Strapi app…"
    # Exclude only the app's own build output. tar's --exclude matches at any
    # depth (bsdtar even with a ./ prefix), so it also stripped every
    # node_modules/*/dist and Strapi died with "Cannot find module '../dist/cli'",
    # a failure that looks like the plugin's fault. rsync anchors a leading /.
    mkdir -p "$ws/app"
    rsync -a --exclude='/.tmp' --exclude='/dist' --exclude='/.cache' "$src/" "$ws/app/"
    cp -R "$ws/app/config" "$dir/config-before"
  fi

  # Cases that need a pre-populated output directory (overwrite behaviour).
  if [ -d "$CASES_DIR/$case_name.seed" ]; then
    cp -R "$CASES_DIR/$case_name.seed/." "$ws/out/"
  fi

  echo "▶ $case_name"
  local start=$SECONDS

  ( cd "$ws" && claude -p "$(cat "$prompt_file")" \
      --permission-mode acceptEdits \
      --add-dir "$ws/.claude/skills/strapi-custom-field" \
      --output-format text ) > "$dir/transcript.txt" 2>&1
  local claude_rc=$?

  local elapsed=$((SECONDS - start))

  # A failed invocation must never reach the assertions. Some cases assert on
  # state that exists before the agent runs (a seeded output directory), so
  # skipping this check lets a case that never executed report a pass.
  if [ "$claude_rc" -ne 0 ]; then
    echo "  ✖ $case_name (${elapsed}s) — claude exited $claude_rc, see $dir/transcript.txt"
    fail=$((fail + 1))
    return
  fi

  # Universal invariant: the canary is never modified, whatever the case does.
  if [ "$(cat "$dir/canary.txt")" != "DO-NOT-TOUCH" ]; then
    echo "  ✖ canary was modified"
    fail=$((fail + 1))
    return
  fi

  if [ -f "$assert_file" ]; then
    # Assertions get: $dir, $ws, $REPO
    if ( set -e; export dir ws REPO; . "$assert_file" ); then
      echo "  ✔ $case_name (${elapsed}s)"
      pass=$((pass + 1))
    else
      echo "  ✖ $case_name (${elapsed}s) — see $dir/transcript.txt"
      fail=$((fail + 1))
    fi
  else
    echo "  ? $case_name (${elapsed}s) — no assertions, transcript at $dir/transcript.txt"
  fi
}

command -v claude >/dev/null || { echo "claude CLI not found on PATH"; exit 1; }

if [ $# -gt 0 ]; then
  for c in "$@"; do run_case "$c"; done
else
  for p in "$CASES_DIR"/*.prompt.txt; do
    run_case "$(basename "$p" .prompt.txt)"
  done
fi

echo
echo "pass $pass  fail $fail"
[ "$fail" -eq 0 ]
