# Strapi Custom Field Plugin Skill

A Claude Code skill that scaffolds complete Strapi v5 custom field plugins from bundled templates — no CLI dependency or network access required.

## What It Does

This skill automates the process of creating a Strapi plugin that adds a custom field to the Content-Type Builder. It:

1. Gathers your requirements (plugin name, field type, icon, etc.)
2. Generates the plugin scaffold from bundled templates
3. Wires up custom field registration (server + admin)
4. Creates a starter React input component using `@strapi/design-system`
5. Builds and verifies the plugin
6. Optionally integrates with an existing Strapi app

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
| Output path     | `./plugins/strapi-plugin-color-picker` |

## Custom Field Templates

Pre-built templates in `templates/custom-fields/`:

| Template | Type | Description |
|----------|------|-------------|
| `rickroll` | string | YouTube video embed — complete working example |
| `string-field` | string | Generic TextInput for short text, colors, codes |
| `json-field` | json | JSON editor with internal state management |
| `text-field` | text | Textarea for long text, markdown |

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
├── admin/
│   └── src/
│       ├── index.ts                        # Custom field registration
│       ├── pluginId.ts
│       ├── components/
│       │   ├── Initializer.tsx
│       │   ├── PluginIcon.tsx
│       │   └── custom-field/
│       │       └── <FieldName>/
│       │           └── index.tsx           # Your React input component
│       ├── pages/
│       │   ├── App.tsx
│       │   └── HomePage.tsx
│       ├── utils/
│       │   └── getTranslation.ts
│       └── translations/
│           └── en.json
├── server/
│   └── src/
│       ├── index.ts
│       ├── register.ts                     # Server-side field registration
│       ├── bootstrap.ts
│       ├── destroy.ts
│       ├── config/
│       ├── controllers/
│       ├── services/
│       ├── routes/
│       ├── middlewares/
│       └── policies/
├── .editorconfig
├── .eslintignore
├── .gitignore
├── .prettierrc
└── .prettierignore
```

## After Scaffolding

1. **Customize the component** — Edit `admin/src/components/custom-field/<Name>/index.tsx` to build your field's UI
2. **Watch mode** — `cd <plugin-path> && npm run watch:link`
3. **Start Strapi** — `cd <strapi-app-path> && npm run develop`
4. **Add the field** — Open the Content-Type Builder in Strapi admin and add your custom field to any content type

## Resources

- [Strapi Custom Fields Docs](https://docs.strapi.io/cms/features/custom-fields)
- [Strapi LLM Docs](https://docs.strapi.io/assets/files/llms-76023c13bb74f7633381307824989b9f.txt)
- [@strapi/sdk-plugin](https://github.com/strapi/sdk-plugin)
- [Strapi Design System Icons](https://design-system-git-main-strapijs.vercel.app/)
