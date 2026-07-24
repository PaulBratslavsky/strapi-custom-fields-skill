# Integer Field Template

A generic number input custom field using `NumberInput` from the Strapi Design System.

- **Field type:** `integer`
- **Use case:** Counts, ratings, scores, numeric values

**Note:** The admin input is UI only — it does not enforce ranges server-side. Values can still be written via the Content API, so add min/max validation via `options.advanced` or content-type validation for production fields.

Placeholders: `{{FIELD_NAME}}`, `{{PLUGIN_ID}}`, `{{DISPLAY_NAME}}`, `{{DESCRIPTION}}`, `{{ICON_NAME}}`, `{{COMPONENT_NAME}}`
