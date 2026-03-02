# Rick Roll Custom Field

A fun example custom field that embeds a YouTube video (Rick Astley's "Never Gonna Give You Up") directly in the Strapi admin panel.

- **Field type:** `string`
- **Icon:** `Play`
- **Use case:** Learning the custom field pattern with a complete working example

The component uses a responsive iframe container to embed the YouTube video with a 16:9 aspect ratio.

**Note:** When integrating with a Strapi app, the CSP middleware must be updated to allow YouTube embeds (`frame-src` and `img-src`).
