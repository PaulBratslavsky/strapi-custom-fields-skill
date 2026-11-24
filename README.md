# Strapi Custom Field Plugin Skill

A Claude Code skill that scaffolds complete Strapi v5 custom field plugins from bundled templates — no CLI dependency or network access required.

## What It Does

This skill automates the process of creating a Strapi plugin that adds a custom field to the Content-Type Builder. It:

1. Gathers your requirements (plugin name, field type, icon, etc.)
2. Generates the plugin scaffold from bundled templates
3. Wires up custom field registration (server + admin) with `inputSize` defaults
4. Creates a starter React input component using `@strapi/design-system` and `styled-components`
5. Configures CSP middleware and `referrerPolicy` for external resources
6. Builds and verifies the plugin
7. Runs a security-considerations checklist before handing off
8. Optionally integrates with an existing Strapi app (standalone or monorepo/workspace)
9. Optionally points you at Strapi Marketplace distribution for reusable fields

## Installation

The root of this repository **is** the skill (`SKILL.md` at the top level). Clone it into your Claude Code skills directory:

```bash
# Global install (available in all projects)
mkdir -p ~/.claude/skills
git clone https://github.com/PaulBratslavsky/strapi-custom-fields-skill.git ~/.claude/skills/strapi-custom-field

# Or project-level install
mkdir -p .claude/skills
git clone https://github.com/PaulBratslavsky/strapi-custom-fields-skill.git .claude/skills/strapi-custom-field
```

If you already have a local copy, copy the repository *contents* into the skills
directory — note the trailing `/.`, which avoids nesting the repo inside itself:

```bash
mkdir -p ~/.claude/skills/strapi-custom-field
cp -R strapi-custom-fields-skill/. ~/.claude/skills/strapi-custom-field/
```

## Usage

In Claude Code, just describe what you want:

```
Create a custom field plugin for a color picker
```

```
Scaffold a Strapi plugin that adds a map coordinate field
```

```
Build a custom field for star ratings
```

```
Create a Strapi custom field plugin using the Rick Roll example
```

Claude will walk you through the setup, asking for:

| Parameter       | Example                          |
| --------------- | -------------------------------- |
| Plugin name     | `strapi-plugin-color-picker`     |
| Plugin ID       | `color-picker` (short — the npm name without the `strapi-plugin-` prefix) |
| Field name      | `color-picker`                   |
| Display name    | `Color Picker`                   |
| Description     | `Pick a color using a color wheel` |
| Field type      | `string`, `json`, `text`, `integer`, or `boolean` |
| Icon            | `PaintBrush`                     |
| Template        | `string-field`, `json-field`, `text-field`, `integer-field`, `boolean-field`, `color-picker`, `star-rating`, `location-picker`, or `rickroll` |
| Output path     | `./plugins/strapi-plugin-color-picker` |

## Skill Structure

```
strapi-custom-field/
├── SKILL.md                              # Execution instructions for Claude
├── README.md                             # This file
├── references/
│   ├── boilerplate.md                    # Component templates by field type
│   └── ui-layout-guide.md               # Styled-components layout patterns
└── templates/
    ├── plugin-base/                      # Full plugin scaffold (30+ files)
    │   ├── admin/
    │   │   ├── src/
    │   │   │   ├── index.ts
    │   │   │   ├── pluginId.ts           # {{PLUGIN_ID}} placeholder
    │   │   │   ├── components/
    │   │   │   │   ├── Initializer.tsx
    │   │   │   │   └── PluginIcon.tsx
    │   │   │   ├── pages/
    │   │   │   │   ├── App.tsx
    │   │   │   │   └── HomePage.tsx
    │   │   │   ├── utils/
    │   │   │   │   └── getTranslation.ts
    │   │   │   └── translations/
    │   │   │       └── en.json
    │   │   ├── custom.d.ts
    │   │   ├── tsconfig.json
    │   │   └── tsconfig.build.json
    │   ├── server/
    │   │   ├── src/
    │   │   │   ├── index.ts
    │   │   │   ├── register.ts
    │   │   │   ├── bootstrap.ts
    │   │   │   ├── destroy.ts
    │   │   │   ├── config/index.ts
    │   │   │   ├── content-types/index.ts
    │   │   │   ├── controllers/
    │   │   │   │   ├── index.ts
    │   │   │   │   └── controller.ts     # {{PLUGIN_ID}} placeholder
    │   │   │   ├── middlewares/index.ts
    │   │   │   ├── policies/index.ts
    │   │   │   ├── routes/
    │   │   │   │   ├── index.ts
    │   │   │   │   ├── content-api/index.ts
    │   │   │   │   └── admin/index.ts
    │   │   │   └── services/
    │   │   │       ├── index.ts
    │   │   │       └── service.ts
    │   │   ├── tsconfig.json
    │   │   └── tsconfig.build.json
    │   ├── package.json.template         # Placeholders for name, id, description
    │   ├── README.md.template
    │   ├── .editorconfig
    │   ├── .eslintignore
    │   ├── .gitignore
    │   ├── .prettierrc
    │   └── .prettierignore
    └── custom-fields/                    # Field type templates (3 override files each)
        ├── rickroll/                     # YouTube embed example
        │   ├── README.md
        │   ├── admin-index.ts
        │   ├── server-register.ts
        │   └── component/
        │       └── RickRollField.tsx
        ├── string-field/                 # Generic TextInput
        │   ├── README.md
        │   ├── admin-index.ts
        │   ├── server-register.ts
        │   └── component/
        │       └── StringField.tsx
        ├── json-field/                   # JSON editor with styled layout
        │   ├── README.md
        │   ├── admin-index.ts
        │   ├── server-register.ts
        │   └── component/
        │       └── JsonField.tsx
        ├── text-field/                   # Textarea
        │   ├── README.md
        │   ├── admin-index.ts
        │   ├── server-register.ts
        │   └── component/
        │       └── TextField.tsx
        ├── integer-field/                # NumberInput
        │   ├── README.md
        │   ├── admin-index.ts
        │   ├── server-register.ts
        │   └── component/
        │       └── IntegerField.tsx
        ├── boolean-field/                # Toggle
        │   ├── README.md
        │   ├── admin-index.ts
        │   ├── server-register.ts
        │   └── component/
        │       └── BooleanField.tsx
        ├── color-picker/                 # Working example: swatch + hex input
        │   ├── README.md
        │   ├── admin-index.ts
        │   ├── server-register.ts
        │   └── component/
        │       └── ColorPickerField.tsx
        ├── star-rating/                  # Working example: 1–5 star buttons
        │   ├── README.md
        │   ├── admin-index.ts
        │   ├── server-register.ts
        │   └── component/
        │       └── StarRatingField.tsx
        └── location-picker/              # Working example: pan/zoom/click map
            ├── README.md
            ├── admin-index.ts
            ├── server-register.ts
            └── component/
                ├── LocationPickerField.tsx
                └── tileMath.ts           # Supporting module — copied as-is
```

## Custom Field Templates

Pre-built templates in `templates/custom-fields/`. Each provides override files that replace the base scaffold's generic admin index and server register, plus the React component itself. Most have a single component file; `location-picker` has a supporting module alongside it, so the whole `component/` directory is copied.

They form a ladder from simple to complex: the `*-field` starters are one correctly-wired input each, the working examples are complete interactive fields extracted from components tested in a live Strapi app, and `location-picker` is the most complex — the reference for a field that loads external resources and needs a CSP change.

| Template | Type | Description |
|----------|------|-------------|
| `rickroll` | string | YouTube video embed — complete working example with `referrerPolicy` |
| `string-field` | string | Generic TextInput for short text, colors, codes |
| `json-field` | json | JSON editor with styled-components layout (FieldColumn, SideBySideRow) |
| `text-field` | text | Textarea for long text, markdown |
| `integer-field` | integer | NumberInput for counts, ratings, numeric values |
| `boolean-field` | boolean | Toggle for flags and on/off values |
| `color-picker` | string | Working example: native color swatch + hex input |
| `star-rating` | integer | Working example: interactive 1–5 star buttons, click-to-clear |
| `location-picker` | json | Working example: pan/zoom/click slippy map + lat-lng inputs; needs one `img-src` CSP entry |

All server-register templates include `inputSize: { default: 12, isResizable: true }` for full-width field rendering in the Content-Type Builder.

## Supported Field Types

| Type      | Best For                                          |
| --------- | ------------------------------------------------- |
| `string`  | Short text, colors, codes, single values          |
| `text`    | Long text, markdown, formatted content            |
| `json`    | Complex objects, coordinates, structured data     |
| `integer` | Counts, ratings, numeric values                   |
| `boolean` | Toggles, flags                                    |

## Generated Plugin Structure

```
strapi-plugin-<name>/
├── package.json
├── README.md
├── admin/
│   ├── src/
│   │   ├── index.ts                        # Custom field registration (app.customFields.register)
│   │   ├── pluginId.ts                     # Plugin identifier constant
│   │   ├── components/
│   │   │   ├── Initializer.tsx
│   │   │   ├── PluginIcon.tsx
│   │   │   └── custom-field/
│   │   │       └── <FieldName>/
│   │   │           └── index.tsx           # Your React input component
│   │   ├── pages/
│   │   │   ├── App.tsx
│   │   │   └── HomePage.tsx
│   │   ├── utils/
│   │   │   └── getTranslation.ts
│   │   └── translations/
│   │       └── en.json
│   ├── custom.d.ts
│   ├── tsconfig.json
│   └── tsconfig.build.json
├── server/
│   ├── src/
│   │   ├── index.ts
│   │   ├── register.ts                     # strapi.customFields.register with inputSize
│   │   ├── bootstrap.ts
│   │   ├── destroy.ts
│   │   ├── config/index.ts
│   │   ├── content-types/index.ts
│   │   ├── controllers/
│   │   │   ├── index.ts
│   │   │   └── controller.ts
│   │   ├── middlewares/index.ts
│   │   ├── policies/index.ts
│   │   ├── routes/
│   │   │   ├── index.ts
│   │   │   ├── content-api/index.ts
│   │   │   └── admin/index.ts
│   │   └── services/
│   │       ├── index.ts
│   │       └── service.ts
│   ├── tsconfig.json
│   └── tsconfig.build.json
├── .editorconfig
├── .eslintignore
├── .gitignore
├── .prettierrc
└── .prettierignore
```

## External Resources & CSP

When your custom field loads external content (iframes, images, scripts, fonts), two things are required in the Strapi app's `config/middlewares.ts`:

1. **CSP directives** — whitelist domains in `frame-src`, `img-src`, `script-src`, etc.
2. **Referrer policy** — set `referrerPolicy: { policy: 'strict-origin-when-cross-origin' }` (required for iframe embeds; Strapi defaults to `no-referrer` which causes YouTube Error 153)

See SKILL.md for the full middleware template and per-service examples.

## Security

The skill runs a security checklist before finishing each scaffold (see "Security considerations" in SKILL.md): minimize external resources, allowlist CSP domains narrowly, never pass user input to iframe/URL sinks, remember that admin UI constraints are not server-side validation, remove unused boilerplate server routes, and keep dependency versions pinned.

## After Scaffolding

1. **Build the plugin** — `cd <plugin-path> && npm run build` (required — Strapi won't load an unbuilt plugin via a local `resolve:` path)
2. **Customize the component** — Edit `admin/src/components/custom-field/<Name>/index.tsx`
3. **Watch mode** — `cd <plugin-path> && npm run watch:link`
4. **Start Strapi** — `cd <strapi-app-path> && npm run develop`
5. **Add the field** — Open the Content-Type Builder and add your custom field to a content type
6. **Optional: share it** — Reusable fields can be published to the [Strapi Marketplace](https://market.strapi.io/); custom fields are only distributable as plugins

## Resources

- [Strapi Custom Fields Docs](https://docs.strapi.io/cms/features/custom-fields)
- [Strapi LLM Docs](https://docs.strapi.io/assets/files/llms-76023c13bb74f7633381307824989b9f.txt)
- [@strapi/sdk-plugin](https://github.com/strapi/sdk-plugin)
- [Strapi Design System Icons](https://design-system-git-main-strapijs.vercel.app/)
