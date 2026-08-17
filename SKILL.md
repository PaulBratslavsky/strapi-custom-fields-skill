---
name: strapi-custom-field
description: >-
  Scaffold a Strapi v5 custom field plugin from bundled templates — no CLI or
  network required. Use when the user wants to create a new Strapi plugin
  that adds a custom field to content types. Triggers on phrases like "create a
  custom field plugin", "scaffold a Strapi plugin", "new custom field for Strapi",
  "build a Strapi custom field", or any request to create a plugin that adds a
  new field type to Strapi's Content-Type Builder.
---

# Strapi Custom Field Plugin Scaffold

Generate a complete Strapi v5 plugin from bundled templates, then wire up custom field registration and a starter React input component. No CLI dependency or network access required.

## Execution Steps

### Step 1: Gather Requirements

First, ask whether the user wants to start from an example template or from scratch:

| Option | Description |
|--------|-------------|
| **Rick Roll example** | A complete working custom field that embeds a YouTube video with thumbnail + click-to-play. Great for learning the pattern. |
| **Start from scratch** | Blank custom field — you provide the details. |

**If the user picks Rick Roll example**, skip the questions below and jump to Step 2 with these pre-filled values, only asking for output path and Strapi app path:
- Plugin name: `strapi-plugin-rickroll`
- Plugin ID: `rickroll`
- Display name: `Rick Roll`
- Description: `Never gonna give you up - embeds the legendary Rick Astley video`
- Custom field name: `rickroll`
- Field type: `string`
- Icon: `Play`
- Template: `rickroll`

**If starting from scratch**, ask the user (use your environment's question tool — `AskUserQuestion` in Claude Code, or the equivalent in other agents):

1. **Plugin name** — npm package name (e.g., `strapi-plugin-color-picker`). Must start with `strapi-plugin-`.

   Derive the **plugin ID** from it by stripping the `strapi-plugin-` prefix (e.g., `color-picker`). Official Strapi plugins always use the short name as the plugin ID (`strapi.name` in `package.json`, `@strapi/plugin-color-picker` → `color-picker`) — never the full npm package name. The server `plugin` value, admin `pluginId`, and the key in `config/plugins.ts` must all use this short ID.
2. **Custom field name** — kebab-case identifier (e.g., `color-picker`).
3. **Display name** — Human-readable label for the Content-Type Builder (e.g., `Color Picker`).
4. **Description** — Short description of the field.
5. **Field type** — Underlying Strapi data type:
   - `string` — Short text, colors, codes, single values
   - `text` — Long text, markdown, formatted content
   - `json` — Complex objects, coordinates, structured data
   - `integer` — Counts, ratings, numeric values
   - `boolean` — Toggles, flags
6. **Icon** — `@strapi/icons` icon name (e.g., `PaintBrush`, `PinMap`, `Star`). Browse at https://design-system-git-main-strapijs.vercel.app/
7. **Template** (optional) — Start from a pre-built template in `templates/custom-fields/`.

   **Generic starters** — a single input wired up correctly, for you to build on:
   - `string-field` — Generic string input with TextInput
   - `json-field` — JSON editor with internal state management
   - `text-field` — Textarea for long text content
   - `integer-field` — Number input for counts, ratings, numeric values
   - `boolean-field` — Toggle for flags and on/off values

   **Working examples** — complete interactive fields, integration-tested:
   - `color-picker` — Color swatch + hex input (string)
   - `star-rating` — Interactive 1–5 star buttons (integer)
   - `location-picker` — Pan/zoom/click map with lat-lng inputs (json). The most
     complex example; also the reference for a field that loads external
     resources. Requires one `img-src` CSP entry — see Step 5b.
   - `rickroll` — Hardcoded YouTube embed (string). A learning example, not a
     production field.

   **Always prefer a working example when the request matches one.** A color
   field, a rating field, or anything map- or location-shaped should start from
   the example rather than a generic starter — the example ships a complete,
   tested UI, and generating an equivalent from scratch produces hundreds of
   lines of unreviewed code that differ on every run.

   Or skip templates entirely and generate from scratch using
   `references/boilerplate.md` — appropriate when nothing above is close.

**Always ask:**

8. **Output path** — Where to create the plugin directory.
9. **Strapi app path** (optional) — Path to an existing Strapi project to integrate with.

### Step 1b: Normalize the identifiers before using them

Several of the answers above become identifiers that Strapi, npm, and the
filesystem each have their own rules about. Check them once, here, rather than
discovering a problem after twenty files are on disk.

| Value | Must match | Why |
|---|---|---|
| Plugin name | `^strapi-plugin-[a-z0-9]+(-[a-z0-9]+)*$` | It is an npm package name — `..`, `/`, spaces, and uppercase are all illegal |
| Plugin ID (derived) | `^[a-z0-9]+(-[a-z0-9]+)*$` | Becomes `strapi.name`, the `config/plugins` key, and part of the admin route |
| Custom field name | `^[a-z0-9]+(-[a-z0-9]+)*$` | PascalCased into `<ComponentName>`, which becomes a **directory name** |
| Field type | exactly one of `string`, `text`, `json`, `integer`, `boolean` | Written unquoted-adjacent into `type: "<field-type>"` in two files and into the component's `onChange` |
| Icon name | `^[A-Za-z][A-Za-z0-9]*$`, **and** a real export of `@strapi/icons` | Becomes both an `import { X }` and a bare identifier `icon: X` |

**Check the icon name against the installed package**, not just the pattern —
this is the one identifier whose mistakes are invisible:

```bash
node -e "console.log(Object.keys(require('@strapi/icons')).includes('<IconName>'))"
```

A name that isn't exported still **builds successfully** (see Step 4), so
nothing downstream will catch it. If the plugin's dependencies aren't installed
yet, check the name at https://design-system-git-main-strapijs.vercel.app/
before writing it.

**If a value doesn't match, do not silently rewrite it.** Say what was wrong,
state the normalized value you propose, and let the user confirm or replace it
before continuing:

> `strapi-plugin-My_Field` isn't a valid npm package name (`_` and uppercase
> aren't allowed). I'd use `strapi-plugin-my-field`, plugin ID `my-field`. OK,
> or would you rather pick a different name?

Normalizing without telling the user is the failure mode to avoid: the plugin ID
is written into five files and the app's `config/plugins`, so a rename they
didn't notice surfaces later as a plugin that won't load.

**Paths are the values that reach a shell.** `<output-path>` is interpolated
into `cd`, `find`, and the `package.json` check below; `<strapi-app-path>` is
interpolated in Step 5. Always **quote them** — `cd "<output-path>"` — so
spaces, globs, redirection, and quoting characters are passed through as data
rather than interpreted:

```bash
cd "<output-path>"
find "<output-path>" -type f -not -path '*/node_modules/*'
```

Quoting is the fix, not a character blacklist — a list of "bad characters"
always misses some (`>`, `<`, `*`, `?`, whitespace, `'`, `"`). If a path still
looks like it contains a command rather than a location, stop and ask which
directory was meant.

### Step 1c: Pick the package manager

Every command below is written as `<pm>` — substitute the manager the target
project actually uses, and use the same one throughout. Assuming `npm` breaks
Yarn and pnpm projects, and mixing managers produces a second lockfile.

Detect it from the Strapi app (or from `<output-path>`'s parent for a
standalone plugin), in this order:

| Signal | `<pm>` |
|---|---|
| `packageManager` field in `package.json` | whatever it names |
| `yarn.lock` | `yarn` |
| `pnpm-lock.yaml` | `pnpm` |
| `bun.lockb` | `bun` |
| `package-lock.json`, or nothing found | `npm` |

Yarn and pnpm also use `workspace:*` for workspace dependencies; npm workspaces
use a plain version range instead. This matters in Step 2c and Step 5.

### Step 2: Generate Plugin from Templates

Copy all files from `templates/plugin-base/` to the output directory. This provides the complete plugin scaffold: admin panel, server, TypeScript configs, linting, and all supporting files.

#### 2a. Copy the base scaffold

**First, check whether `<output-path>` already exists and is non-empty.** If it
is, list what's in it and ask before writing — scaffolding over an existing
directory merges two plugins into one tree, and the leftovers from the old one
are hard to spot afterwards. Only proceed without asking when the directory is
absent or empty.

Offer two options: delete the directory and start clean, or scaffold somewhere
else. **Deleting requires an explicit yes.** Name the exact directory in the
question, wait for an affirmative answer, and delete only that path. Silence, an
ambiguous reply, or anything other than clear agreement means do not delete —
ask for a different output path instead.

Copy the entire `templates/plugin-base/` directory tree to `<output-path>/`:

```text
templates/plugin-base/admin/    →  <output-path>/admin/
templates/plugin-base/server/   →  <output-path>/server/
templates/plugin-base/.editorconfig, .eslintignore, .gitignore, .prettierrc, .prettierignore
```

Do NOT copy `package.json.template` or `README.md.template` as-is — these are processed in the next step.

#### 2b. Replace placeholders in scaffold files

Only two files in the base scaffold contain placeholders:

- `admin/src/pluginId.ts` — replace `{{PLUGIN_ID}}` with the short plugin ID (e.g., `color-picker`)
- `server/src/controllers/controller.ts` — replace `{{PLUGIN_ID}}` with the short plugin ID

#### 2c. Generate `package.json` from template

Read `templates/plugin-base/package.json.template` and replace all placeholders:

| Placeholder | Value |
|---|---|
| `{{PKG_NAME}}` | Plugin name (e.g., `strapi-plugin-color-picker`) |
| `{{PLUGIN_ID}}` | Short plugin ID — package name without the `strapi-plugin-` prefix (e.g., `color-picker`) |
| `{{DISPLAY_NAME}}` | Display name (e.g., `Color Picker`) |
| `{{DESCRIPTION}}` | Description text |

`{{DISPLAY_NAME}}` and `{{DESCRIPTION}}` are free text, and they are substituted
into a JSON file. Escape them as JSON string contents — a `"`, `\`, or newline
pasted in raw produces a `package.json` that no longer parses, which then fails
at install time with a message that points at the file rather than at the
description the user typed. `{{PKG_NAME}}` and `{{PLUGIN_ID}}` are already
constrained by Step 1b and need no escaping.

Write the result as `<output-path>/package.json`, then confirm it parses (for
example `node -e "JSON.parse(require('fs').readFileSync(process.argv[1]))" "<output-path>/package.json"`)
before moving on.

**Important — dependency versions:** The template ships with pinned version ranges for Strapi packages. If the plugin will be integrated into an existing Strapi app (Step 5), align the versions with that app first: read the app's `package.json` and use the same `@strapi/strapi` version range so the plugin builds against the same APIs. In a monorepo with workspaces, use the workspace protocol (e.g., `"@strapi/strapi": "workspace:*"` for Yarn) instead. Never widen versions back to `"*"` — unpinned versions resolve to whatever is latest at install time, which breaks reproducibility and can pull in incompatible majors. Then install:

```bash
cd "<output-path>"
<pm> install
```

#### 2d. Generate `README.md` from template

Read `templates/plugin-base/README.md.template` and replace `{{PKG_NAME}}` and `{{DESCRIPTION}}`. Write as `<output-path>/README.md`.

#### 2e. Verify the scaffold

List the generated files to confirm the structure:

```bash
find "<output-path>" -type f -not -path '*/node_modules/*' -not -path '*/dist/*' | sort
```

### Step 3: Wire Up Custom Field Support

The base scaffold generates a generic plugin. Now apply the custom field overrides — either from a template or from scratch.

#### Option A: Using a template from `templates/custom-fields/`

If the user chose a template (rickroll, string-field, json-field, text-field, integer-field, boolean-field, color-picker, star-rating, or location-picker), copy the override files from that template:

1. `templates/custom-fields/<template>/server-register.ts` → `<output-path>/server/src/register.ts`
2. `templates/custom-fields/<template>/admin-index.ts` → `<output-path>/admin/src/index.ts`
3. Everything in `templates/custom-fields/<template>/component/` → `<output-path>/admin/src/components/custom-field/<ComponentName>/`

For (3), the `*Field.tsx` file is the component entry and is renamed to
`index.tsx`. Any **other** file in `component/` is a supporting module and keeps
its own name. Most templates have one file; `location-picker` has two
(`LocationPickerField.tsx` → `index.tsx`, plus `tileMath.ts` copied as-is).
Copy the whole directory rather than assuming a single file, or the component
will fail to build on a missing import.

**Note:** Copying `admin-index.ts` over `admin/src/index.ts` replaces the base scaffold's admin entry entirely — including its menu link and admin page registration. This is intentional for custom-field-only plugins (they don't need an admin page), but if the user also wants a plugin settings/admin page, merge the custom field registration into the existing `admin/src/index.ts` instead of overwriting it.

#### 3a-bis. Remove the unused base scaffold surface

`templates/plugin-base/` is a general-purpose plugin scaffold, so it ships a
server API and an admin page that a custom-field-only plugin never uses. Once
`admin/src/index.ts` has been replaced above, these files are unreachable — the
admin entry no longer registers a page, and nothing routes to the server
controller. Leaving them in means shipping a live content-api route the plugin
doesn't need, which is what the "Security considerations" checklist below means
by unused server surface.

Unless the user asked for a plugin admin page or a server API, delete:

```text
<output-path>/admin/src/pages/               (App.tsx, HomePage.tsx)
<output-path>/server/src/controllers/        (index.ts, controller.ts)
<output-path>/server/src/routes/             (index.ts, admin/, content-api/)
<output-path>/server/src/services/           (index.ts, service.ts)
<output-path>/server/src/policies/
<output-path>/server/src/middlewares/
<output-path>/server/src/content-types/
```

Then edit `<output-path>/server/src/index.ts` to drop the corresponding imports
and exports, leaving `register`, `bootstrap`, `destroy`, and `config`. Run
`<pm> run typecheck` (Step 4) afterwards — it will fail loudly on any import you
missed, which is the point.

**Tell the user what you deleted**, in one line. If they do want an admin page or
server API, skip this step and say so instead.

**For the rickroll template:** Files are pre-filled with real values — no placeholder replacement needed. The component directory name should be `RickRollField`.

**For other templates:** Replace all placeholders in the copied files:

| Placeholder | Value |
|---|---|
| `{{FIELD_NAME}}` | Custom field name, kebab-case (e.g., `color-picker`) |
| `{{PKG_NAME}}` | Plugin name (e.g., `strapi-plugin-color-picker`) |
| `{{PLUGIN_ID}}` | Short plugin ID — package name without the `strapi-plugin-` prefix (e.g., `color-picker`) |
| `{{DISPLAY_NAME}}` | Display name (e.g., `Color Picker`) |
| `{{DESCRIPTION}}` | Description text |
| `{{ICON_NAME}}` | Icon component name (e.g., `PaintBrush`) |
| `{{COMPONENT_NAME}}` | PascalCase component name derived from field name + "Field" (e.g., `ColorPickerField`) |

#### Option B: Starting from scratch (no template)

If the user didn't choose a template, generate the 3 files manually:

**3b-1. Create `server/src/register.ts`:**

```typescript
import type { Core } from "@strapi/strapi";

const register = ({ strapi }: { strapi: Core.Strapi }) => {
  strapi.customFields.register({
    name: "<field-name>",
    plugin: "<plugin-id>", // short ID, e.g. "color-picker" — NOT the npm package name
    type: "<field-type>",
    inputSize: {
      default: 12,
      isResizable: true,
    },
  });
};

export default register;
```

**3b-2. Create `admin/src/index.ts`:**

```typescript
import { getTranslation } from "./utils/getTranslation";
import { PLUGIN_ID } from "./pluginId";
import { Initializer } from "./components/Initializer";
import { <IconName> } from "@strapi/icons";

export default {
  register(app: any) {
    app.customFields.register({
      name: "<field-name>",
      pluginId: PLUGIN_ID,
      type: "<field-type>",
      intlLabel: {
        id: getTranslation("<field-name>.label"),
        defaultMessage: "<Display Name>",
      },
      intlDescription: {
        id: getTranslation("<field-name>.description"),
        defaultMessage: "<description>",
      },
      icon: <IconName>,
      components: {
        Input: async () =>
          import("./components/custom-field/<ComponentDir>").then((m) => ({
            default: m.<ComponentName>,
          })),
      },
    });

    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
    });
  },

  async registerTrads({ locales }: { locales: string[] }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(
            `./translations/${locale}.json`
          );
          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );
  },
};
```

**3b-3. Create the React component** at `admin/src/components/custom-field/<ComponentName>/index.tsx`.

Use `<ComponentName>` as PascalCase of the field name + "Field" (e.g., `color-picker` → `ColorPickerField`).

Read `references/boilerplate.md` for starter component templates for each field type (`string`, `json`, `text`, `integer`, `boolean`). Pick the template matching the user's chosen field type. Replace `{{COMPONENT_NAME}}` and `{{FIELD_LABEL}}` placeholders with actual values.

The component must:
- Accept Strapi's custom field props: `name`, `onChange`, `value`, `intlLabel`, `required`, `disabled`, `error`, `description`, `placeholder`, `attribute`
- Call `onChange({ target: { name, value, type: "<field-type>" } })` to update the value
- Use `@strapi/design-system` components for consistent admin UI styling
- Follow the rules in the "External Resources & CSP Middleware" section below if embedding external content (iframes, images, scripts, fonts, APIs)
- Follow the "Security considerations" checklist below — especially if the field accepts URLs, IDs, or HTML from the user

### Step 4: Build and Verify

```bash
cd "<output-path>"
<pm> install
<pm> run typecheck
<pm> run build
<pm> run verify
```

**Run `<pm> run typecheck` before `<pm> run build` — the build alone is not a
correctness check.** `strapi-plugin build` bundles with Vite, which resolves a
missing named export to `undefined` and still exits 0. The most common way this
bites: a misspelled or non-existent `@strapi/icons` name. The build succeeds, the
plugin loads, and the only symptom is an empty icon slot next to the field in the
Content-Type Builder — no error anywhere. `tsc` catches it as
`TS2305: Module '"@strapi/icons"' has no exported member '<Name>'`.

`<pm> run verify` checks `package.json` metadata and the `exports` map. It does
**not** need a running Strapi instance, and it does not execute component code —
so it cannot catch the icon problem either.

If a step fails, read the error output, fix the issue, and re-run. Common issues:
- `TS2305` on an icon import — the icon name doesn't exist in `@strapi/icons`.
  Check the name at https://design-system-git-main-strapijs.vercel.app/
- Other TypeScript errors in the React component
- `sh: strapi-plugin: command not found` — the install didn't complete

**If you need to start over:** delete `<output-path>` entirely before
re-scaffolding. A partial scaffold left from a failed run shadows the problem —
stale files survive the re-copy and produce errors that don't match the current
templates. Tell the user which directory you are deleting before you delete it.

**The build is not optional.** A plugin wired into a Strapi app via a local `resolve:` path (Step 5) is loaded from its `dist/` output — Strapi will not load an unbuilt plugin. Always run `<pm> run build` before starting the Strapi app, and rebuild (or use `<pm> run watch`) after component changes.

### Step 5: Add Plugin to a Strapi App

If the user provided a Strapi app path in Step 1, or ask now if they want to integrate.

**This step edits files in a project you did not create.** `config/plugins.ts`
and `config/middlewares.ts` are hand-maintained files that usually already have
content worth keeping. For each one: read it first, show the user the change you
intend to make, and apply it only after they agree. Never rewrite either file
wholesale — merge into what's there, preserving existing plugin entries,
directives, and comments.

#### 5a. Register the plugin in `config/plugins.ts` (or `config/plugins.js`)

Check which config format the app uses — Strapi apps may have `config/plugins.ts` **or** `config/plugins.js`. Edit whichever exists (create `plugins.ts` for TypeScript projects, `plugins.js` for JavaScript projects if neither exists). Add the plugin entry, preserving any existing plugins:

```typescript
export default () => ({
  // ... existing plugins stay here
  "<plugin-id>": {
    enabled: true,
    resolve: "<relative-path-from-strapi-root-to-plugin>",
  },
});
```

**Do not add an `env` parameter you don't use.** A TypeScript Strapi app compiles
`config/` under `noImplicitAny`, so writing `export default ({ env }) => ({...})`
in a file that would otherwise not have it fails the dev server at startup:

```text
config/plugins.ts:1:19 - error TS7031: Binding element 'env' implicitly has an 'any' type.
[ERROR] Error during development: TypeScript compilation failed
```

A plugin `resolve:` entry needs no environment lookup, so the no-argument form
above is correct. If you are merging into a file that **already** destructures
`env`, leave its signature exactly as you found it — it is already typed, or the
project already compiles with it.

The key is the **short plugin ID** (e.g., `color-picker`), matching `strapi.name` in the plugin's `package.json` — not the npm package name.

**Build first:** The plugin must be built (`<pm> run build` in the plugin directory) before Strapi can load it via `resolve:` — Strapi loads the compiled `dist/` output, and an unbuilt plugin fails at startup.

**Monorepo / Yarn workspaces:** If the Strapi app lives in a monorepo (e.g., a workspace like `examples/getstarted`), adapt the plugin instead of using the standalone defaults:
- Place the plugin somewhere inside the workspace tree (e.g., `src/plugins/<plugin-id>/`) and reference it with a relative `resolve:` path.
- Use workspace-protocol or exact versions in the plugin's `package.json` that match the monorepo's Strapi version (e.g., `"@strapi/strapi": "workspace:*"` for Yarn), so the workspace resolver links against the local packages.
- Use the monorepo's own package manager (`<pm>`, detected in Step 1c) for
  every command, including the Step 4 build.

#### 5b. Update CSP Security Middleware (if needed)

**When to update:** Any time the custom field's React component loads external resources — iframes, images, scripts, fonts, stylesheets, API calls, or media from domains other than `'self'`. If the field is purely local UI with no external resources, skip this step.

**How to update:** Read the existing `config/middlewares.ts`. If `'strapi::security'` is a plain string, expand it to an object config. If it already has an object config, merge in the new domains. See the "External Resources & CSP Middleware" section below for the full directive reference and examples.

**IMPORTANT:** After updating `config/middlewares.ts`, the Strapi server MUST be restarted for changes to take effect. CSP headers are set at server startup — changing the file alone does nothing until restart.

#### 5c. Install and Start

```bash
cd "<strapi-app-path>"
<pm> install
<pm> run develop
```

### Step 6: Summary

Before writing the summary, run through the "Security considerations" checklist below and confirm each point.

```text
Plugin created at: <output-path>
Plugin name: <plugin-name>
Plugin ID: <plugin-id>
Custom field: <field-name> (type: <field-type>)
Icon: <icon-name>

Generated files (from templates):
  All plugin scaffold files (admin/, server/, configs)
  server/src/register.ts                     — Custom field server registration
  admin/src/index.ts                         — Custom field admin registration + icon
  admin/src/components/custom-field/<Name>/index.tsx — React input component

Strapi integration:
  config/plugins.ts                          — Plugin enabled with resolve path
  config/middlewares.ts                      — CORS/CSP updated (if applicable)

Checks run:
  <pm> run typecheck                         — passed (catches bad icon names)
  <pm> run build                             — passed
  <pm> run verify                            — passed

Development workflow:
  1. Customize the React component in admin/src/components/custom-field/<Name>/index.tsx
  2. Watch mode: cd "<output-path>" && <pm> run watch:link
  3. Start Strapi: cd "<strapi-app-path>" && <pm> run develop
  4. Add the custom field to a content type in the Content-Type Builder

Security: External resources added? CSP updated minimally? User input sanitized?
  Unused content-api routes removed? Values validated beyond admin UI?

Optional — Share your field: If this plugin is meant for other Strapi projects,
  consider publishing it to the Strapi Marketplace (https://market.strapi.io/).
  Custom fields are only distributable as plugins. Skip if internal-only.
```

### Step 7: Share your field (optional)

Ask the user whether this plugin is for internal use or for distribution.

**Skip if:** demo/learning plugin (e.g., Rick Roll), app-specific field, or user confirmed internal-only. Do not push publishing after every scaffold — local install via npm or `resolve:` is valid for private/team use.

**If distributing to other Strapi projects:**

1. Confirm the plugin is production-ready:
   - `<pm> run typecheck`, `<pm> run build` and `<pm> run verify` pass
   - The custom field calls `onChange` and persists values correctly
   - README covers install, configuration, and CSP middleware changes (if applicable)
   - Plugin ID is the short name (`color-picker`), not the full npm package name
   - Dependency versions are pinned (no `"*"`)
   - Unused boilerplate server routes/controllers/services are removed

2. Point the user to Strapi Marketplace submission:
   - https://market.strapi.io/
   - Plugin development docs: https://docs.strapi.io/cms/plugins-development/developing-plugins

3. Set expectations:
   - Marketplace review takes time; the skill cannot handle submission details (screenshots, listing copy, review)
   - Plugins wired via a local `resolve:` path in a monorepo must be extracted into a standalone package before publishing

## Security considerations

Before finishing (Step 6), review the plugin you created. Custom fields run in the Strapi admin panel (authenticated), but mistakes here can still weaken the admin CSP, expose routes, or allow bad data via the Content API.

**Always consider:**

1. **Minimize external resources** — Do not add iframes, third-party scripts, fonts, or API calls unless the field requires them. If none are needed, skip CSP changes entirely.

2. **CSP: allowlist narrowly** — When updating `config/middlewares.ts`, add only the specific domains required. Each entry must be a concrete origin (`https://tile.openstreetmap.org`), not a wildcard (`https://*.example.com`), not a bare scheme (`'https:'`), and not `'unsafe-inline'` beyond what Strapi's admin already requires. If you cannot name the exact host a resource loads from, find out before editing the CSP rather than widening a directive to cover it. Show the user the diff before writing. Pasting a full permissive template weakens the admin CSP more than a single embed needs.

3. **Never trust user input for embeds or URLs** — If the field accepts a URL, ID, or HTML from the user, parse and validate it before use. Never assign user input directly to `iframe src`, `href`, `fetch()`, or `dangerouslySetInnerHTML`. Prefer allowlisted embed URL patterns: extract an ID, rebuild a known-safe URL (see the YouTube parser in "Iframe Embed Rules").

4. **Admin UI is not server validation** — The React input controls what editors see, not what the API accepts. Values can still be written via the Content API. For production fields, consider `options.advanced` constraints (min, max, regex — as `@strapi/plugin-color-picker` does) or document that content-type validation is the app's responsibility.

5. **Remove unused server surface** — Custom-field-only plugins usually need only `server/src/register.ts`. Remove or lock down the boilerplate content-api route, controller, and service if the plugin doesn't use them — they are unnecessary attack surface in a published plugin.

6. **Pin dependencies** — Keep the pinned versions from `package.json.template`; never use `"*"`. Do not commit secrets or API keys; use Strapi config / env vars for credentials.

7. **Before Marketplace or wide distribution** — Re-run `<pm> run verify`, confirm `onChange` persists values correctly, review the CSP diff, and ensure the README documents any required middleware changes.

**When in doubt:** prefer a simpler field (local UI, built-in type, no external calls) over a feature that requires broad CSP exceptions or user-controlled embeds.

## External Resources & CSP Middleware

When the custom field loads anything from external domains, Strapi's Content Security Policy (CSP) will block it by default. You MUST update `config/middlewares.ts` to whitelist the required domains, and you MUST restart Strapi after changes.

### CSP Directive Reference

| Directive | What it controls | When to add |
|---|---|---|
| `frame-src` | Iframe embed sources | YouTube, Vimeo, Google Maps, any `<iframe>` |
| `img-src` | Image sources | Thumbnails, CDN-hosted images, map tiles, avatars |
| `script-src` | JavaScript sources | Third-party widget scripts, analytics, SDK scripts |
| `style-src` | Stylesheet sources | CDN fonts (Google Fonts), external CSS |
| `font-src` | Font file sources | Google Fonts, Adobe Fonts, custom font CDNs |
| `connect-src` | XHR/fetch/WebSocket targets | REST APIs, GraphQL endpoints, tile servers, WebSockets |
| `media-src` | Audio/video sources | Self-hosted media, streaming, blob URLs |

### Template: Expanded `strapi::security` middleware

```typescript
{
  name: 'strapi::security',
  config: {
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'connect-src': ["'self'", 'blob:'],
        'img-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io'],
        'script-src': ["'self'"],
        'frame-src': ["'self'"],
        'media-src': ["'self'", 'blob:'],
        'style-src': ["'self'", "'unsafe-inline'"],
        'font-src': ["'self'"],
      },
    },
    // REQUIRED for iframe embeds — Strapi's default is 'no-referrer' which
    // causes YouTube Error 153 and similar failures on other embed services.
    // Many services check the Referer header to validate embed requests.
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
  },
},
```

Start from this base and add only the specific domains your plugin needs — do not paste the template with extra broad directives. Always keep `"'self'"` in every directive. Never add a blanket `'https:'` source (it allows requests to **any** HTTPS origin), and never add `'unsafe-inline'` to `script-src` — `style-src` keeps it only because Strapi's admin (styled-components) requires it. The `referrerPolicy` override is **required** whenever your plugin uses iframes — without it, Strapi sends `Referrer-Policy: no-referrer` which causes embed services to reject the request. If the field loads no external resources at all, leave `config/middlewares.ts` untouched.

### Common Examples by Plugin Type

**YouTube / Vimeo embeds:**
```typescript
'frame-src': ["'self'", 'https://www.youtube.com', 'https://www.youtube-nocookie.com', 'https://player.vimeo.com'],
'img-src': [..., 'img.youtube.com', 'i.ytimg.com', 'i.vimeocdn.com'],
```

**Raster map tiles (the `location-picker` template):**
```typescript
'img-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', 'https://tile.openstreetmap.org'],
```
Tiles are plain images, so this is the only directive that changes — no
`script-src`, `frame-src`, or `connect-src` entry is needed.

**Google Maps / Mapbox:**
```typescript
'frame-src': ["'self'", 'https://www.google.com'],
'img-src': [..., 'https://a.tile.openstreetmap.org', 'https://b.tile.openstreetmap.org', 'https://api.mapbox.com'],
'connect-src': [..., 'https://api.mapbox.com', 'https://events.mapbox.com'],
'script-src': [..., 'https://api.mapbox.com'],
```

**Google Fonts / Adobe Fonts:**
```typescript
'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
'font-src': ["'self'", 'https://fonts.gstatic.com'],
```

**External REST API (e.g., weather, geocoding):**
```typescript
'connect-src': ["'self'", 'https://api.openweathermap.org'],
'img-src': [..., 'https://openweathermap.org'],
```

**CDN-hosted assets (images, icons, scripts):**
```typescript
'img-src': [..., 'https://cdn.example.com'],
'script-src': [..., 'https://cdn.example.com'],
'style-src': ["'self'", "'unsafe-inline'", 'https://cdn.example.com'],
```

### Iframe Embed Rules

**CRITICAL: Every `<iframe>` MUST include `referrerPolicy="strict-origin-when-cross-origin"`.**

YouTube and other embed services require a referrer to validate requests. Without this attribute, the browser may send no referrer (due to Strapi's default `no-referrer` policy), causing YouTube Error 153 and similar failures on other services. This is needed even if the server-side `referrerPolicy` is also set.

```tsx
<iframe
  src="https://www.youtube.com/embed/VIDEO_ID"
  referrerPolicy="strict-origin-when-cross-origin"
  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
/>
```

**Grant only the `allow` permissions the embed needs.** The list above is the
baseline for a video player. Do not add `clipboard-write`, `web-share`,
`camera`, `microphone`, or `geolocation` to a read-only embed — a player that
only plays video has no use for them, and `allow` is what delegates those
capabilities to the third-party frame.

**Always use the embed/player URL, never the regular page URL.**

| Service | WRONG (page URL) | CORRECT (embed URL) |
|---|---|---|
| YouTube | `youtube.com/watch?v=ID` | `youtube.com/embed/ID` |
| Vimeo | `vimeo.com/ID` | `player.vimeo.com/video/ID` |
| Google Maps | `google.com/maps/place/...` | `google.com/maps/embed/v1/place?key=...&q=...` |
| Spotify | `open.spotify.com/track/ID` | `open.spotify.com/embed/track/ID` |
| SoundCloud | `soundcloud.com/artist/track` | Use [oEmbed API](https://developers.soundcloud.com/docs/oembed) |

**If the component accepts a URL from the user as input**, it MUST parse the URL and convert it to the embed format. Never pass user-entered URLs directly to an iframe `src`.

Example URL-to-embed parser for YouTube:

```typescript
const toYouTubeEmbedUrl = (url: string): string | null => {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};
```

### Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| YouTube "Error 153" with correct `/embed/` URL | Missing referrer — YouTube requires it to validate embeds | **Two fixes needed:** (1) Add `referrerPolicy="strict-origin-when-cross-origin"` attribute to the `<iframe>` element, AND (2) Add `referrerPolicy: { policy: 'strict-origin-when-cross-origin' }` to the security middleware config. Both are required. |
| YouTube "Error 153" | Using `/watch?v=` URL instead of `/embed/` | Parse URL to extract video ID, use `/embed/ID` format |
| Blank iframe, no error visible | CSP `frame-src` missing the embed domain | Add domain to `frame-src` in `config/middlewares.ts`, restart Strapi |
| Broken images from external sources | CSP `img-src` missing the image domain | Add domain to `img-src`, restart Strapi |
| External font not loading | CSP `font-src` or `style-src` missing | Add font CDN to `font-src` and stylesheet CDN to `style-src` |
| API call fails from admin panel | CSP `connect-src` missing the API domain | Add API domain to `connect-src`, restart Strapi |
| Changes to `middlewares.ts` have no effect | Strapi not restarted | Stop and restart Strapi (`<pm> run develop`) |

## Reference

- Custom fields docs: https://docs.strapi.io/cms/features/custom-fields
- Strapi LLM docs: https://docs.strapi.io/assets/files/llms-76023c13bb74f7633381307824989b9f.txt
- SDK Plugin CLI: https://github.com/strapi/sdk-plugin
- Design System icons: https://design-system-git-main-strapijs.vercel.app/
- Starter component templates by field type: see `references/boilerplate.md`
- UI layout patterns and spacing: see `references/ui-layout-guide.md`
- Custom field type templates: see `templates/custom-fields/`

**Plugin Development API docs:**
- Admin Panel API: https://docs.strapi.io/cms/plugins-development/admin-panel-api
- Content Manager APIs: https://docs.strapi.io/cms/plugins-development/content-manager-apis
- Server API: https://docs.strapi.io/cms/plugins-development/server-api
- Plugins Extension: https://docs.strapi.io/cms/plugins-development/plugins-extension

**Plugin Development Guides:**
- Pass data from server to admin: https://docs.strapi.io/cms/plugins-development/guides/pass-data-from-server-to-admin
- Admin permissions for plugins: https://docs.strapi.io/cms/plugins-development/guides/admin-permissions-for-plugins
- Store and access data: https://docs.strapi.io/cms/plugins-development/guides/store-and-access-data
- Create components for plugins: https://docs.strapi.io/cms/plugins-development/guides/create-components-for-plugins

Key constraints:
- Custom fields cannot create new data types — must use existing Strapi types
- Custom fields cannot modify how an existing data type behaves — they only provide a custom input UI that reads/writes that type's value; the underlying type's storage, validation, and API behavior stay unchanged
- Cannot use relation, media, component, or dynamic zone types
- Custom fields can only be shared with other Strapi projects as plugins (e.g., via the Marketplace) — copying admin component code alone does not distribute a field
- The `name` must match between server-side and admin-side registration
- The `plugin` value in server registration must match `pluginId` in admin registration, and both must be the **short plugin ID** (`strapi.name` in `package.json`, e.g. `color-picker`) — not the npm package name
- **Always set `inputSize`** in server registration — Strapi's edit view uses a 12-column grid and fields default to size 6 (half width). Custom fields should always include `inputSize: { default: 12, isResizable: true }` to render full width by default. Valid sizes: `4`, `6`, `8`, `12`.
