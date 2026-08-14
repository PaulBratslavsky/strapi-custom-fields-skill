// Static assertions over the bundled templates and SKILL.md.
//
// Scope: things a successful `npm run build` cannot see. A plugin builds fine
// with an over-permissive iframe, a wide-open CSP, or a component that writes
// fractional values into an integer field — so those are checked here.
//
// Run: cd test && npm test

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join, basename } from "node:path";

import {
  CUSTOM_FIELDS_DIR,
  KNOWN_PLACEHOLDERS,
  componentEntry,
  placeholdersIn,
  readRepoFile,
  readTemplate,
  renderTemplate,
  templateNames,
} from "./render.mjs";

const SKILL = readRepoFile("SKILL.md");
const README = readRepoFile("README.md");
const BOILERPLATE = readRepoFile("references", "boilerplate.md");
const TEMPLATES = templateNames();

describe("template structure", () => {
  for (const name of TEMPLATES) {
    test(`${name} has the required override files`, () => {
      const files = readTemplate(name);
      for (const required of ["README.md", "admin-index.ts", "server-register.ts"]) {
        assert.ok(files[required], `${name} is missing ${required}`);
      }
      assert.ok(
        componentEntry(files),
        `${name} has no component/*Field.tsx entry file`
      );
    });
  }
});

describe("placeholders", () => {
  for (const name of TEMPLATES) {
    test(`${name} uses only documented placeholders`, () => {
      for (const [path, body] of Object.entries(readTemplate(name))) {
        for (const token of placeholdersIn(body)) {
          assert.ok(
            KNOWN_PLACEHOLDERS.has(token),
            `${name}/${path} uses undocumented placeholder {{${token}}} — ` +
              `it would ship to the user verbatim`
          );
        }
      }
    });

    test(`${name} renders with nothing left over`, () => {
      // rickroll is pre-filled by design (SKILL.md Step 3), so it has none to
      // begin with; the assertion still holds for it.
      for (const [path, body] of Object.entries(renderTemplate(name))) {
        assert.ok(
          !body.includes("{{"),
          `${name}/${path} still contains a placeholder after rendering`
        );
      }
    });
  }
});

describe("registration coherence", () => {
  // A mismatch here means the field silently fails to register: Strapi matches
  // the server and admin registrations by name + plugin id.
  const field = (src, key) => src.match(new RegExp(`${key}:\\s*["']([^"']+)["']`))?.[1];

  for (const name of TEMPLATES) {
    test(`${name} server and admin registrations agree`, () => {
      const files = readTemplate(name);
      const server = files["server-register.ts"];
      const admin = files["admin-index.ts"];

      assert.equal(
        field(server, "name"),
        field(admin, "name"),
        `${name}: custom field name differs between server and admin`
      );
      assert.equal(
        field(server, "type"),
        field(admin, "type"),
        `${name}: field type differs between server and admin`
      );
      assert.ok(
        /plugin:\s*["']/.test(server),
        `${name}: server register has no plugin id`
      );
      assert.ok(
        /pluginId:\s*PLUGIN_ID/.test(admin),
        `${name}: admin register should use the PLUGIN_ID constant`
      );
    });

    test(`${name} sets inputSize`, () => {
      // SKILL.md "Key constraints": custom fields default to half width without it.
      assert.match(
        readTemplate(name)["server-register.ts"],
        /inputSize:\s*\{/,
        `${name}: server register is missing inputSize`
      );
    });
  }
});

describe("iframe permissions", () => {
  // Verified against the rickroll template, where clipboard-write and web-share
  // survived a review that claimed to have removed them.
  const FORBIDDEN = ["clipboard-write", "web-share", "camera", "microphone", "geolocation"];

  const sources = [
    ["SKILL.md", SKILL],
    ...TEMPLATES.flatMap((name) =>
      Object.entries(readTemplate(name)).map(([p, b]) => [`${name}/${p}`, b])
    ),
  ];

  for (const [label, body] of sources) {
    const allows = [...body.matchAll(/allow=["']([^"']+)["']/g)].map((m) => m[1]);
    if (allows.length === 0) continue;

    test(`${label} grants no unnecessary iframe permissions`, () => {
      for (const allow of allows) {
        for (const bad of FORBIDDEN) {
          assert.ok(
            !allow.includes(bad),
            `${label}: iframe allow= grants "${bad}", which a read-only embed does not need`
          );
        }
      }
    });
  }

  test("every iframe sets referrerPolicy", () => {
    // SKILL.md flags this as CRITICAL: without it YouTube returns Error 153.
    for (const [label, body] of sources) {
      for (const tag of body.match(/<iframe[\s\S]*?\/>/g) ?? []) {
        assert.match(
          tag,
          /referrerPolicy=["']strict-origin-when-cross-origin["']/,
          `${label}: an <iframe> is missing referrerPolicy`
        );
      }
    }
  });
});

describe("CSP guidance stays narrow", () => {
  test("the middleware template has no blanket sources", () => {
    const block = SKILL.match(/```typescript\n\{\n\s*name: 'strapi::security'[\s\S]*?```/)?.[0];
    assert.ok(block, "could not locate the strapi::security template in SKILL.md");

    assert.ok(
      !/['"]https:['"]/.test(block),
      "the CSP template allows a bare 'https:' source, which permits any HTTPS origin"
    );

    const scriptSrc = block.match(/'script-src':\s*\[([^\]]*)\]/)?.[1] ?? "";
    assert.ok(
      !scriptSrc.includes("unsafe-inline"),
      "'unsafe-inline' must not appear in script-src"
    );
  });

  test("no template injects HTML directly", () => {
    for (const name of TEMPLATES) {
      for (const [path, body] of Object.entries(readTemplate(name))) {
        assert.ok(
          !body.includes("dangerouslySetInnerHTML"),
          `${name}/${path} uses dangerouslySetInnerHTML`
        );
      }
    }
  });
});

describe("integer fields round their values", () => {
  // An integer-typed field that emits 3.7 is truncated or rejected server-side.
  // The component exists in two places, which is how it drifted before.
  const sources = [
    ["templates/custom-fields/integer-field", readTemplate("integer-field")[
      "component/IntegerField.tsx"
    ]],
    ["references/boilerplate.md", BOILERPLATE],
  ];

  for (const [label, body] of sources) {
    test(`${label} guards against fractional input`, () => {
      const handler = body.match(/handleValueChange[\s\S]{0,500}?\n\s*\};/)?.[0];
      assert.ok(handler, `${label}: could not find handleValueChange`);
      assert.match(
        handler,
        /Math\.round|Math\.trunc|Number\.isInteger/,
        `${label}: handleValueChange passes fractional values straight through`
      );
    });
  }
});

describe("mount-time writes respect disabled", () => {
  // A read-only field must not dirty the entry just by rendering. Only effects
  // that actually call onChange are relevant — a component may have several.
  const writingEffects = (body) =>
    [...body.matchAll(/useEffect\(\(\)\s*=>\s*\{[\s\S]*?\},\s*\[[^\]]*\]\s*\);/g)]
      .map((m) => m[0])
      .filter((effect) => /onChange\(/.test(effect));

  for (const name of TEMPLATES) {
    const files = readTemplate(name);
    const effects = writingEffects(files[componentEntry(files)]);
    if (effects.length === 0) continue;

    test(`${name} does not call onChange on mount while disabled`, () => {
      for (const effect of effects) {
        assert.match(
          effect,
          /!disabled|disabled\s*\?/,
          `${name}: an effect calls onChange without checking disabled`
        );
        assert.match(
          effect,
          /\[[^\]]*\bdisabled\b[^\]]*\]/,
          `${name}: disabled is missing from the effect dependency list`
        );
      }
    });
  }
});

describe("package.json.template", () => {
  const raw = readRepoFile("templates", "plugin-base", "package.json.template");

  test("renders to valid JSON with awkward free text", () => {
    // DISPLAY_NAME and DESCRIPTION are free text substituted into JSON.
    const hostile = {
      PKG_NAME: "strapi-plugin-my-field",
      PLUGIN_ID: "my-field",
      DISPLAY_NAME: 'He said "hello"',
      DESCRIPTION: "Line one\nline two, with a \\ backslash",
    };

    const rendered = raw.replace(/\{\{\s*([A-Z_]+)\s*\}\}/g, (whole, key) =>
      key in hostile
        ? JSON.stringify(hostile[key]).slice(1, -1) // escape as JSON string body
        : whole
    );

    assert.doesNotThrow(
      () => JSON.parse(rendered),
      "package.json.template must survive quotes, newlines and backslashes in free-text fields"
    );
  });

  test("dependency versions are pinned", () => {
    const pkg = JSON.parse(
      raw.replace(/\{\{\s*([A-Z_]+)\s*\}\}/g, "placeholder")
    );
    for (const group of ["dependencies", "devDependencies", "peerDependencies"]) {
      for (const [dep, range] of Object.entries(pkg[group] ?? {})) {
        assert.notEqual(range, "*", `${group}.${dep} is unpinned`);
      }
    }
  });

  test("react ranges match the shipped @types/react", () => {
    const pkg = JSON.parse(
      raw.replace(/\{\{\s*([A-Z_]+)\s*\}\}/g, "placeholder")
    );
    const types = pkg.devDependencies["@types/react"];
    const major = types.match(/(\d+)/)[1];
    for (const group of ["devDependencies", "peerDependencies"]) {
      const range = pkg[group].react;
      assert.ok(
        !/\^17/.test(range),
        `${group}.react allows React 17 but @types/react is ${types}`
      );
      assert.ok(
        range.includes(major),
        `${group}.react (${range}) does not cover the React major the types target (${major})`
      );
    }
  });

  test("scripts run under npm", () => {
    const pkg = JSON.parse(
      raw.replace(/\{\{\s*([A-Z_]+)\s*\}\}/g, "placeholder")
    );
    for (const [script, cmd] of Object.entries(pkg.scripts)) {
      assert.ok(
        !/^run\s+-T\b/.test(cmd),
        `script "${script}" uses Yarn-Berry "run -T", which fails under the npm workflow SKILL.md prescribes`
      );
    }
    assert.ok(pkg.scripts.typecheck, "a typecheck script is required by Step 4");
  });
});

describe("docs match the templates on disk", () => {
  test("every template is listed in SKILL.md and README.md", () => {
    for (const name of TEMPLATES) {
      assert.ok(SKILL.includes(name), `SKILL.md does not mention the ${name} template`);
      assert.ok(README.includes(name), `README.md does not mention the ${name} template`);
    }
  });

  test("every template named in SKILL.md's list exists on disk", () => {
    const listed = [...SKILL.matchAll(/^\s*-\s*`([a-z-]+)`\s*—/gm)].map((m) => m[1]);
    for (const name of listed) {
      if (!/-field$|picker$|rating$|rickroll/.test(name)) continue;
      assert.ok(
        existsSync(join(CUSTOM_FIELDS_DIR, name)),
        `SKILL.md offers the ${name} template but templates/custom-fields/${name} does not exist`
      );
    }
  });

  test("SKILL.md Step 4 runs the typecheck", () => {
    // The build alone exits 0 on a nonexistent icon import; only tsc catches it.
    assert.match(
      SKILL,
      /npm run typecheck/,
      "Step 4 must run the typecheck — the build does not catch bad icon names"
    );
  });

  test("fenced blocks declare a language", () => {
    const lines = SKILL.split("\n");
    let inFence = false;
    lines.forEach((line, i) => {
      if (!line.startsWith("```")) return;
      if (inFence) {
        inFence = false;
        return;
      }
      inFence = true;
      assert.notEqual(
        line.trim(),
        "```",
        `SKILL.md:${i + 1} opens a fenced block with no language`
      );
    });
  });
});

describe("multi-file component templates", () => {
  test("location-picker ships its supporting module", () => {
    const files = readTemplate("location-picker");
    assert.ok(files["component/tileMath.ts"], "tileMath.ts is missing");

    const entry = files[componentEntry(files)];
    assert.match(entry, /from "\.\/tileMath"|from '\.\/tileMath'/);
  });

  test("SKILL.md tells the agent to copy the whole component directory", () => {
    // Copying only `component/<ComponentName>.tsx` would drop tileMath.ts and
    // break the build on a missing import.
    assert.match(
      SKILL,
      /Everything in `templates\/custom-fields\/<template>\/component\/`/,
      "Step 3 Option A must copy the component directory, not a single file"
    );
  });

  test("tile URLs are built from bounded integers only", () => {
    const tileMath = readTemplate("location-picker")["component/tileMath.ts"];
    const builder = tileMath.match(/buildTileUrl[\s\S]*?\n\};/)?.[0] ?? "";
    assert.match(builder, /clamp\(/, "buildTileUrl must bound its coordinates");
    assert.match(builder, /Math\.floor/, "buildTileUrl must floor its coordinates");
  });
});
