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
- Plugin ID: `strapi-plugin-rickroll`
- Display name: `Rick Roll`
- Description: `Never gonna give you up - embeds the legendary Rick Astley video`
- Custom field name: `rickroll`
- Field type: `string`
- Icon: `Play`
- Template: `rickroll`

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
7. **Template** (optional) — Start from a pre-built template in `templates/custom-fields/`:
   - `string-field` — Generic string input with TextInput
   - `json-field` — JSON editor with internal state management
   - `text-field` — Textarea for long text content
   - Or skip to generate from scratch using `references/boilerplate.md`

**Always ask:**

8. **Output path** — Where to create the plugin directory.
9. **Strapi app path** (optional) — Path to an existing Strapi project to integrate with.

### Step 2: Generate Plugin from Templates

Copy all files from `templates/plugin-base/` to the output directory. This provides the complete plugin scaffold: admin panel, server, TypeScript configs, linting, and all supporting files.

#### 2a. Copy the base scaffold

Copy the entire `templates/plugin-base/` directory tree to `<output-path>/`:

```
templates/plugin-base/admin/    →  <output-path>/admin/
templates/plugin-base/server/   →  <output-path>/server/
templates/plugin-base/.editorconfig, .eslintignore, .gitignore, .prettierrc, .prettierignore
```

Do NOT copy `package.json.template` or `README.md.template` as-is — these are processed in the next step.

#### 2b. Replace placeholders in scaffold files

Only two files in the base scaffold contain placeholders:

- `admin/src/pluginId.ts` — replace `{{PLUGIN_ID}}` with the plugin ID (e.g., `strapi-plugin-color-picker`)
- `server/src/controllers/controller.ts` — replace `{{PLUGIN_ID}}` with the plugin ID

#### 2c. Generate `package.json` from template

Read `templates/plugin-base/package.json.template` and replace all placeholders:

| Placeholder | Value |
|---|---|
| `{{PKG_NAME}}` | Plugin name (e.g., `strapi-plugin-color-picker`) |
| `{{PLUGIN_ID}}` | Plugin ID (usually same as plugin name) |
| `{{DISPLAY_NAME}}` | Display name (e.g., `Color Picker`) |
| `{{DESCRIPTION}}` | Description text |

Write the result as `<output-path>/package.json`.

**Important:** The `devDependencies` in the template use `"*"` as version placeholders. After writing the file, resolve these to actual latest versions by running:

```bash
cd <output-path>
npm install
```

This will resolve `"*"` versions to the latest available packages and create `node_modules/` and `package-lock.json`.

#### 2d. Generate `README.md` from template

Read `templates/plugin-base/README.md.template` and replace `{{PKG_NAME}}` and `{{DESCRIPTION}}`. Write as `<output-path>/README.md`.

#### 2e. Verify the scaffold

List the generated files to confirm the structure:

```bash
find <output-path> -type f -not -path '*/node_modules/*' -not -path '*/dist/*' | sort
```

### Step 3: Wire Up Custom Field Support

The base scaffold generates a generic plugin. Now apply the custom field overrides — either from a template or from scratch.

#### Option A: Using a template from `templates/custom-fields/`

If the user chose a template (rickroll, string-field, json-field, or text-field), copy the 3 override files from that template:

1. `templates/custom-fields/<template>/server-register.ts` → `<output-path>/server/src/register.ts`
2. `templates/custom-fields/<template>/admin-index.ts` → `<output-path>/admin/src/index.ts`
3. `templates/custom-fields/<template>/component/<ComponentName>.tsx` → `<output-path>/admin/src/components/custom-field/<ComponentName>/index.tsx`

**For the rickroll template:** Files are pre-filled with real values — no placeholder replacement needed. The component directory name should be `RickRollField`.

**For other templates (string-field, json-field, text-field):** Replace all placeholders in the copied files:

| Placeholder | Value |
|---|---|
| `{{FIELD_NAME}}` | Custom field name, kebab-case (e.g., `color-picker`) |
| `{{PKG_NAME}}` | Plugin name (e.g., `strapi-plugin-color-picker`) |
| `{{PLUGIN_ID}}` | Plugin ID (same as plugin name) |
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
    plugin: "<plugin-name>",
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

Read `references/boilerplate.md` for starter component templates for each field type (`string`, `json`, `text`). Pick the template matching the user's chosen field type. Replace `{{COMPONENT_NAME}}` and `{{FIELD_LABEL}}` placeholders with actual values.

The component must:
- Accept Strapi's custom field props: `name`, `onChange`, `value`, `intlLabel`, `required`, `disabled`, `error`, `description`, `placeholder`, `attribute`
- Call `onChange({ target: { name, value, type: "<field-type>" } })` to update the value
- Use `@strapi/design-system` components for consistent admin UI styling
- Follow the rules in the "External Resources & CSP Middleware" section below if embedding external content (iframes, images, scripts, fonts, APIs)

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

#### 5b. Update CSP Security Middleware (if needed)

**When to update:** Any time the custom field's React component loads external resources — iframes, images, scripts, fonts, stylesheets, API calls, or media from domains other than `'self'`. If the field is purely local UI with no external resources, skip this step.

**How to update:** Read the existing `config/middlewares.ts`. If `'strapi::security'` is a plain string, expand it to an object config. If it already has an object config, merge in the new domains. See the "External Resources & CSP Middleware" section below for the full directive reference and examples.

**IMPORTANT:** After updating `config/middlewares.ts`, the Strapi server MUST be restarted for changes to take effect. CSP headers are set at server startup — changing the file alone does nothing until restart.

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

Generated files (from templates):
  All plugin scaffold files (admin/, server/, configs)
  server/src/register.ts                     — Custom field server registration
  admin/src/index.ts                         — Custom field admin registration + icon
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
        'connect-src': ["'self'", 'https:', 'blob:'],
        'img-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io'],
        'script-src': ["'self'", "'unsafe-inline'"],
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

Start from this base and add only the domains your plugin needs. Always keep `"'self'"` in every directive. The `referrerPolicy` override is **required** whenever your plugin uses iframes — without it, Strapi sends `Referrer-Policy: no-referrer` which causes embed services to reject the request.

### Common Examples by Plugin Type

**YouTube / Vimeo embeds:**
```typescript
'frame-src': ["'self'", 'https://www.youtube.com', 'https://www.youtube-nocookie.com', 'https://player.vimeo.com'],
'img-src': [..., 'img.youtube.com', 'i.ytimg.com', 'i.vimeocdn.com'],
```

**Google Maps / Mapbox:**
```typescript
'frame-src': ["'self'", 'https://www.google.com'],
'img-src': [..., 'https://*.tile.openstreetmap.org', 'https://api.mapbox.com'],
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
'connect-src': ["'self'", 'https:', 'https://api.openweathermap.org'],
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
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
/>
```

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
| Changes to `middlewares.ts` have no effect | Strapi not restarted | Stop and restart Strapi (`npm run develop`) |

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
- Cannot use relation, media, component, or dynamic zone types
- The `name` must match between server-side and admin-side registration
- The `plugin` value in server registration must match `pluginId` in admin registration
- **Always set `inputSize`** in server registration — Strapi's edit view uses a 12-column grid and fields default to size 6 (half width). Custom fields should always include `inputSize: { default: 12, isResizable: true }` to render full width by default. Valid sizes: `4`, `6`, `8`, `12`.
