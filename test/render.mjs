// Renders a bundled template the way SKILL.md Step 3 describes, so the static
// tests have something concrete to assert against.
//
// This mirrors the skill's substitution rules; it is NOT shipped as part of the
// skill and the agent does not call it. Behaviour that only an agent can
// exercise (the Step 1b rules, the confirmation gates) is covered by the eval
// suite under test/eval/, not here.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const CUSTOM_FIELDS_DIR = join(REPO_ROOT, "templates", "custom-fields");
export const PLUGIN_BASE_DIR = join(REPO_ROOT, "templates", "plugin-base");

/** The placeholder set documented in SKILL.md Step 3. */
export const KNOWN_PLACEHOLDERS = new Set([
  "PKG_NAME",
  "PLUGIN_ID",
  "FIELD_NAME",
  "DISPLAY_NAME",
  "DESCRIPTION",
  "ICON_NAME",
  "COMPONENT_NAME",
  "FIELD_LABEL",
]);

/** Values a well-behaved run would produce for Step 1b. */
export const FIXTURE = {
  PKG_NAME: "strapi-plugin-my-field",
  PLUGIN_ID: "my-field",
  FIELD_NAME: "my-field",
  DISPLAY_NAME: "My Field",
  DESCRIPTION: "A field for testing",
  ICON_NAME: "PaintBrush",
  COMPONENT_NAME: "MyFieldField",
  FIELD_LABEL: "My Field",
};

export const templateNames = () =>
  readdirSync(CUSTOM_FIELDS_DIR).filter((n) =>
    statSync(join(CUSTOM_FIELDS_DIR, n)).isDirectory()
  );

/** Every `{{TOKEN}}` appearing in a string. */
export const placeholdersIn = (text) =>
  [...text.matchAll(/\{\{\s*([A-Z_]+)\s*\}\}/g)].map((m) => m[1]);

export const substitute = (text, values = FIXTURE) =>
  text.replace(/\{\{\s*([A-Z_]+)\s*\}\}/g, (whole, key) =>
    key in values ? values[key] : whole
  );

/** Read every file of a template as {relativePath: contents}. */
export const readTemplate = (name) => {
  const root = join(CUSTOM_FIELDS_DIR, name);
  const out = {};

  const walk = (dir, prefix = "") => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const rel = prefix ? `${prefix}/${entry}` : entry;
      if (statSync(full).isDirectory()) walk(full, rel);
      else out[rel] = readFileSync(full, "utf8");
    }
  };

  walk(root);
  return out;
};

/** Render a template with the fixture values applied. */
export const renderTemplate = (name, values = FIXTURE) =>
  Object.fromEntries(
    Object.entries(readTemplate(name)).map(([path, body]) => [
      path,
      substitute(body, values),
    ])
  );

/** The component entry file for a template (the `*Field.tsx` in component/). */
export const componentEntry = (files) =>
  Object.keys(files).find(
    (p) => p.startsWith("component/") && basename(p).endsWith("Field.tsx")
  );

export const readRepoFile = (...parts) =>
  readFileSync(join(REPO_ROOT, ...parts), "utf8");
