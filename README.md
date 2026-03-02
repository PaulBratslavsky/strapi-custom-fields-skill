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
7. Optionally integrates with an existing Strapi app

## Installation

Copy the `strapi-custom-field` folder into your Claude Code skills directory:

```bash
# Global install (available in all projects)
cp -r strapi-custom-field ~/.claude/skills/strapi-custom-field

# Or project-level install
cp -r strapi-custom-field .claude/skills/strapi-custom-field
```

Or install the packaged `.skill` file:

```bash
claude install-skill strapi-custom-field.skill
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
| Field name      | `color-picker`                   |
| Display name    | `Color Picker`                   |
| Description     | `Pick a color using a color wheel` |
| Field type      | `string`, `json`, `text`, `integer`, or `boolean` |
| Icon            | `PaintBrush`                     |
| Template        | `string-field`, `json-field`, `text-field`, or `rickroll` |
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
        └── text-field/                   # Textarea
            ├── README.md
            ├── admin-index.ts
            ├── server-register.ts
            └── component/
                └── TextField.tsx
```

## Custom Field Templates

Pre-built templates in `templates/custom-fields/`. Each provides 3 override files that replace the base scaffold's generic admin index, server register, and add a React component.

| Template | Type | Description |
|----------|------|-------------|
| `rickroll` | string | YouTube video embed — complete working example with `referrerPolicy` |
| `string-field` | string | Generic TextInput for short text, colors, codes |
| `json-field` | json | JSON editor with styled-components layout (FieldColumn, SideBySideRow) |
| `text-field` | text | Textarea for long text, markdown |

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

## After Scaffolding

1. **Customize the component** — Edit `admin/src/components/custom-field/<Name>/index.tsx`
2. **Watch mode** — `cd <plugin-path> && npm run watch:link`
3. **Start Strapi** — `cd <strapi-app-path> && npm run develop`
4. **Add the field** — Open the Content-Type Builder and add your custom field to a content type

## Resources

- [Strapi Custom Fields Docs](https://docs.strapi.io/cms/features/custom-fields)
- [Strapi LLM Docs](https://docs.strapi.io/assets/files/llms-76023c13bb74f7633381307824989b9f.txt)
- [@strapi/sdk-plugin](https://github.com/strapi/sdk-plugin)
- [Strapi Design System Icons](https://design-system-git-main-strapijs.vercel.app/)
