# Star Rating Template

A working star rating custom field: five clickable ★ buttons (amber when active, gray when inactive, hover scale effect). Clicking a star stores that integer 1–5; clicking the currently-selected star clears the field to `null`.

- **Field type:** `integer`
- **Use case:** Ratings, scores, rankings — a realistic complete example with an interactive UI

The star row is keyboard-accessible (`radiogroup`/`radio` roles) and uses styled-components with theme tokens (no inline styles).

**Note:** The admin input is UI only — the 1–5 range is not enforced server-side. Values can still be written via the Content API, so add min/max validation via `options.advanced` or content-type validation for production fields.

Placeholders: `{{FIELD_NAME}}`, `{{PLUGIN_ID}}`, `{{DISPLAY_NAME}}`, `{{DESCRIPTION}}`, `{{ICON_NAME}}`, `{{COMPONENT_NAME}}`
