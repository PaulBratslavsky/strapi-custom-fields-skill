# Color Picker Template

A working color picker custom field: a native color-swatch input (opens the OS color wheel) side by side with an editable hex text input. Both write the same `string` value (`#RRGGBB`).

- **Field type:** `string`
- **Use case:** Brand colors, accent colors, theme values — a realistic complete example, comparable to `@strapi/plugin-color-picker`

Invalid or empty hex values fall back to black for the swatch preview without corrupting the stored value. The layout uses styled-components with theme tokens (no inline styles).

**Note:** The admin input is UI only — the hex format is not enforced server-side. Values can still be written via the Content API, so add regex validation via `options.advanced` or content-type validation for production fields.

Placeholders: `{{FIELD_NAME}}`, `{{PLUGIN_ID}}`, `{{DISPLAY_NAME}}`, `{{DESCRIPTION}}`, `{{ICON_NAME}}`, `{{COMPONENT_NAME}}`
