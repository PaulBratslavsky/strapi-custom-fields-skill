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

  # Cases that integrate with an app get a minimal Strapi config to edit.
  if [ -d "$CASES_DIR/$case_name.app" ]; then
    cp -R "$CASES_DIR/$case_name.app" "$ws/app"
    cp -R "$CASES_DIR/$case_name.app" "$dir/app-before"
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

  local elapsed=$((SECONDS - start))

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
