---
name: strapi-custom-field
description: >-
  Scaffold a Strapi v5 custom field plugin with full boilerplate using the
  @strapi/sdk-plugin CLI. Use when the user wants to create a new Strapi plugin
  that adds a custom field to content types. Triggers on phrases like "create a
  custom field plugin", "scaffold a Strapi plugin", "new custom field for Strapi",
  "build a Strapi custom field", or any request to create a plugin that adds a
  new field type to Strapi's Content-Type Builder.
---

# Strapi Custom Field Plugin Scaffold

Use the `@strapi/sdk-plugin` CLI to scaffold a Strapi v5 plugin, then wire up custom field registration and a starter React input component.

## Execution Steps

### Step 1: Gather Requirements

First, ask whether the user wants to start from an example template or from scratch:

| Option | Description |
|--------|-------------|
| **Rick Roll example** | A complete working custom field that embeds a YouTube video with thumbnail + click-to-play. Great for learning the pattern. |
| **Start from scratch** | Blank custom field — you provide the details. |

**If the user picks Rick Roll example**, skip the questions below and jump to Step 2 with these pre-filled values, only asking for output path and Strapi app path:
- Plugin name: `strapi-plugin-rickroll`
- Custom field name: `rickroll`
- Display name: `Rick Roll`
- Description: `Never gonna give you up - embeds the legendary Rick Astley video`
- Field type: `string`
- Icon: `Play`
- Then in Step 3, use the template files from `assets/rickroll-example/` instead of the generic boilerplate.

**If starting from scratch**, ask using `AskUserQuestion`:

1. **Plugin name** — npm package name (e.g., `strapi-plugin-color-picker`). Must start with `strapi-plugin-`.
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

**Always ask:**

7. **Output path** — Where to create the plugin directory.
8. **Strapi app path** (optional) — Path to an existing Strapi project to integrate with.

### Step 2: Scaffold with the Plugin CLI

Use the bundled `scripts/scaffold-plugin.sh` script to run `npx @strapi/sdk-plugin@latest init` non-interactively. The script uses `expect` to answer all 12 CLI prompts automatically (plugin name, id, display name, description, author, license, admin/server registration, editorconfig, ESLint, Prettier, TypeScript — all answered yes):

```bash
bash <skill-path>/scripts/scaffold-plugin.sh <output-path> <plugin-name> "<display-name>" "<description>"
```

Example:
```bash
bash <skill-path>/scripts/scaffold-plugin.sh ./plugins/strapi-plugin-color-picker strapi-plugin-color-picker "Color Picker" "Pick colors with a visual color wheel"
```

This generates the complete plugin structure: package.json, tsconfig files, admin/server directories, Initializer, PluginIcon, routes, controllers, services, and all supporting files.

**Verify the scaffold succeeded** — check that `<output-path>/package.json` exists, then list the generated files:

```bash
find <output-path> -type f -not -path '*/node_modules/*' -not -path '*/dist/*' | sort
```

**If `expect` is not available**, fall back to running the CLI interactively and let the user answer the prompts:
```bash
npx @strapi/sdk-plugin@latest init <output-path>
```

### Step 3: Wire Up Custom Field Support

The CLI generates a generic plugin. Now modify **only** the files that need custom field logic. Do NOT rewrite files the CLI already generated correctly (tsconfig, supporting utilities, etc.).

Read each file before editing to preserve what the CLI generated.

**If using the Rick Roll example template:** Copy the 3 files from `assets/rickroll-example/` directly:
- `assets/rickroll-example/server-register.ts` → `<output-path>/server/src/register.ts`
- `assets/rickroll-example/admin-index.ts` → `<output-path>/admin/src/index.ts`
- `assets/rickroll-example/RickRollField.tsx` → `<output-path>/admin/src/components/custom-field/RickRollField/index.tsx`

Then skip to Step 4.

**If starting from scratch**, apply these modifications:

#### 3a. Update `server/src/register.ts`

Read the existing file, then replace its contents to register the custom field on the server side:

```typescript
import type { Core } from "@strapi/strapi";

const register = ({ strapi }: { strapi: Core.Strapi }) => {
  strapi.customFields.register({
    name: "<field-name>",
    plugin: "<plugin-name>",
    type: "<field-type>",
  });
};

export default register;
```

#### 3b. Update `admin/src/index.ts`

Read the existing file first. Replace the `register` method to add custom field registration alongside the existing plugin registration. Keep the `registerTrads` method that the CLI generated.

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

  // Keep the registerTrads method from the CLI scaffold
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

#### 3c. Create the Custom Field React Component

This is the only **new** file to create. Add it at:
`admin/src/components/custom-field/<ComponentName>/index.tsx`

Use `<ComponentName>` as PascalCase of the field name (e.g., `color-picker` → `ColorPickerField`).

The component must:
- Accept Strapi's custom field props: `name`, `onChange`, `value`, `intlLabel`, `required`, `disabled`, `error`, `description`, `placeholder`, `attribute`
- Call `onChange({ target: { name, value, type: "<field-type>" } })` to update the value
- Use `@strapi/design-system` components for consistent admin UI styling

Read `references/boilerplate.md` for starter component templates for each field type (`string`, `json`, `text`). Pick the template matching the user's chosen field type.

#### 3d. Add Missing Dependencies

Check if these are already in the CLI-generated `package.json`. Only add what's missing:

```bash
cd <output-path>
# Check what the CLI already added, then add only what's missing:
npm install --save-dev @strapi/design-system@^2.0.0-rc.30 @strapi/icons@^2.0.0-rc.30
```

Also add them as `peerDependencies` if not already present.

### Step 4: Build and Verify

```bash
cd <output-path>
npm install
npm run build
npm run verify
```

If build fails, read the error output, fix the issue, and rebuild. Common issues:
- Missing icon import (check icon name exists in `@strapi/icons`)
- TypeScript errors in the React component

### Step 5: Add Plugin to a Strapi App

If the user provided a Strapi app path in Step 1, or ask now if they want to integrate.

#### 5a. Register the plugin in `config/plugins.ts`

Read the existing `config/plugins.ts` in the Strapi app (create it if it doesn't exist). Add the plugin entry, preserving any existing plugins:

```typescript
export default ({ env }) => ({
  // ... existing plugins stay here
  "<plugin-name>": {
    enabled: true,
    resolve: "<relative-path-from-strapi-root-to-plugin>",
  },
});
```

If the plugin needs configuration (e.g., API keys), add a `config` object:
```typescript
"<plugin-name>": {
  enabled: true,
  resolve: "<relative-path>",
  config: {
    apiKey: env("PLUGIN_API_KEY"),
  },
},
```

#### 5b. Update CORS and Security Middleware (if needed)

**Only if** the custom field's React component loads external resources (maps, iframes, external scripts, CDN assets, fonts, etc.).

Read the existing `config/middlewares.ts`. If it uses the default string format (`'strapi::security'`), expand it to an object config. If it already has an object config, merge in the new domains.

**For the Rick Roll example**, the component embeds a YouTube iframe, so the middleware MUST be updated with both `img-src` (for thumbnails) and `frame-src` (for the embed):

```typescript
{
  name: 'strapi::security',
  config: {
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'connect-src': ["'self'", 'https:', 'blob:'],
        'img-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', 'img.youtube.com'],
        'script-src': ["'self'", "'unsafe-inline'"],
        'frame-src': ["'self'", 'https://www.youtube.com'],
      },
    },
  },
},
```

If the `middlewares.ts` uses the default string format (`'strapi::security'`), expand it to this object config. If it already has an object config, add `'img.youtube.com'` to `img-src` and `'https://www.youtube.com'` to `frame-src` (create the `frame-src` array if it doesn't exist).

**For other plugins**, common cases:
- **Map plugins** (Mapbox, Leaflet) — add tile server and API domains to `connect-src`, `img-src`, `script-src`
- **Embed plugins** (YouTube, Vimeo) — add to `frame-src` and `img-src`
- **CDN assets** (fonts, icons) — add to `style-src`, `font-src`
- **External API calls** from admin panel — add to `connect-src`

If the custom field is purely local UI with no external resources, skip this step entirely.

#### 5c. Install and Start

```bash
cd <strapi-app-path>
npm install
npm run develop
```

### Step 6: Summary

```
Plugin created at: <output-path>
Plugin name: <plugin-name>
Custom field: <field-name> (type: <field-type>)
Icon: <icon-name>

Modified files (from CLI scaffold):
  server/src/register.ts                     — Added custom field registration
  admin/src/index.ts                         — Added custom field + icon registration

New files:
  admin/src/components/custom-field/<Name>/index.tsx — React input component

Strapi integration:
  config/plugins.ts                          — Plugin enabled with resolve path
  config/middlewares.ts                      — CORS/CSP updated (if applicable)

Development workflow:
  1. Customize the React component in admin/src/components/custom-field/<Name>/index.tsx
  2. Watch mode: cd <output-path> && npm run watch:link
  3. Start Strapi: cd <strapi-app-path> && npm run develop
  4. Add the custom field to a content type in the Content-Type Builder
```

## Reference

- Custom fields docs: https://docs.strapi.io/cms/features/custom-fields
- SDK Plugin CLI: https://github.com/strapi/sdk-plugin
- Design System icons: https://design-system-git-main-strapijs.vercel.app/
- Starter component templates by field type: see `references/boilerplate.md`

Key constraints:
- Custom fields cannot create new data types — must use existing Strapi types
- Cannot use relation, media, component, or dynamic zone types
- The `name` must match between server-side and admin-side registration
- The `plugin` value in server registration must match `pluginId` in admin registration
