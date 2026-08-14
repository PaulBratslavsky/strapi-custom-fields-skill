# Tests

Development-only. Nothing here is part of the skill — the agent never reads or
runs any of it, and it can be deleted from an installed copy without effect.

## Two suites, and why

The skill is a markdown procedure plus a set of templates. Those fail in
different ways, so they are tested differently.

| | `npm test` | `npm run test:eval` |
|---|---|---|
| Tests | The templates and SKILL.md as text | The skill as executed by an agent |
| Speed | ~1s | minutes per case |
| Cost | none | API tokens |
| Deterministic | yes | no |
| Run it | always | before a release, after editing SKILL.md |

### `npm test` — static assertions

```bash
cd test && npm test
```

Zero dependencies, Node's built-in runner. Deliberately scoped to **things a
successful `npm run build` cannot see**, because a plugin builds perfectly well
with an over-permissive iframe, a wide-open CSP, or a component that writes
fractional values into an integer field.

Covers: template structure, placeholder hygiene, server/admin registration
coherence, `inputSize`, iframe `allow` and `referrerPolicy`, CSP template
breadth, integer rounding (in both the template *and* its copy in
`references/boilerplate.md`, which is how they drifted apart before), mount-time
`onChange` guarded by `disabled`, `package.json.template` surviving quotes and
newlines in free text, dependency pinning, npm-compatible scripts, and
doc/disk agreement on the template list.

### `npm run test:eval` — the skill, actually run

```bash
cd test && ./eval/run.sh                    # all cases
cd test && ./eval/run.sh location-picker    # one case
```

Drives a headless `claude -p` per case in a throwaway workspace, with the
**working tree** installed as the skill (not whatever is in `~/.claude/skills`),
then asserts on the resulting filesystem rather than on transcript wording, so
the assertions survive rephrasing.

This is the only suite that can test the parts of `SKILL.md` that are
instructions rather than artifacts — Step 1b's identifier rules, the Step 2a
overwrite check, the Step 5 confirmation gates.

| Case | Asserts |
|---|---|
| `bad-plugin-name` | An illegal name is surfaced to the user, not silently rewritten, and never escapes the output directory |
| `hostile-output-path` | Shell metacharacters in the output path are never executed |
| `awkward-description` | Quotes, newlines, and backslashes in free text still yield parseable `package.json` |
| `populated-output-dir` | A pre-existing file in the output directory survives |
| `location-picker` | Template used (not regenerated), CSP gains only the tile origin, unused server surface removed, **and the plugin installs, typechecks, builds, and a real Strapi boots with it** |

### Integration cases use a real Strapi app

Marking a case `cases/<name>.needs-app` gives it a genuine `create-strapi`
application, scaffolded once by `eval/make-app.sh` into a gitignored `.app/`
cache and copied per run.

This replaced an earlier stub — three static config files standing in for an
app. A stub cannot load a plugin, so anything built on it can only check *what
the agent wrote into config*, never whether the plugin registers, boots, renders
or persists. Two real bugs were invisible until a real app ran:

- `export default ({ env }) => ({...})` — the snippet the skill told users to
  write into `config/plugins.ts` — fails a TypeScript Strapi app at startup with
  `TS7031: Binding element 'env' implicitly has an 'any' type`
- Nothing confirmed that Step 3a-bis's deletions leave the plugin bootable

The scaffold is slow and network-bound; `FORCE=1 ./eval/make-app.sh` recreates
it if the cache goes stale.

Adding a case: drop `cases/<name>.prompt.txt` and `cases/<name>.assert.sh`
(which receives `$dir`, `$ws`, `$REPO`). Optional `cases/<name>.needs-app`
requests the real Strapi app at `$ws/app`; optional `cases/<name>.seed/`
pre-populates the output directory.

**Results vary between runs.** These assert on behaviour the skill asks an LLM
to perform, so a failure means "the instruction was not reliably followed",
which is a real finding about the wording — but re-run before concluding a
regression. A case that fails consistently is a bug in `SKILL.md`.
