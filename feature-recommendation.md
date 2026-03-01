# Feature Recommendation: Non-Interactive CLI Flags for `@strapi/sdk-plugin init`

## Problem

The `strapi-plugin init` command uses the `prompts` library for all user input, which requires a TTY (interactive terminal). This makes it unusable from:

- **AI coding agents** (Claude Code, GitHub Copilot, Cursor, etc.) — agents can't type into interactive prompts
- **CI/CD pipelines** — automated scaffolding in GitHub Actions, GitLab CI, etc.
- **Shell scripts** — piping input fails because `prompts` reads keystrokes character-by-character, not line-by-line
- **Programmatic usage** — other tools that want to scaffold plugins as part of a larger workflow

The current workaround requires `expect` (a Unix TTY automation tool) to simulate a terminal session with all 12 prompts, which is fragile and platform-dependent.

## Current State of the Code

**Source:** `src/cli/commands/utils/init/prompts.ts`

The `--silent` flag already exists and calls `getDefaultAnswers()` which skips all prompts. However, it forces empty values for `displayName` and `description`, and there's no way to override individual values. The `--silent` flag is also semantically wrong for this use case — users want non-interactive mode, not silence.

The architecture is already well-suited for this change:

```
command.ts → action.ts → init.ts → prompts.ts → file-generator.ts → file-writer.ts
```

The `runPrompts()` function in `prompts.ts` already returns a `PromptAnswer[]` array, and `getDefaultAnswers()` shows how to construct answers without prompts. The file generator consumes these answers identically regardless of source.

## Proposed Solution

### Add CLI flags that map to each prompt

In `command.ts`, add these options:

```typescript
.option('--name <name>', 'Plugin package name')
.option('--plugin-id <id>', 'Plugin ID used by Strapi')
.option('--display-name <name>', 'Plugin display name')
.option('--description <desc>', 'Plugin description')
.option('--author-name <name>', 'Author name')
.option('--author-email <email>', 'Author email')
.option('--repo-url <url>', 'Git repository URL')
.option('--license <license>', 'License (default: MIT)')
.option('--no-admin', 'Skip admin panel registration')
.option('--no-server', 'Skip server registration')
.option('--no-typescript', 'Use JavaScript instead of TypeScript')
.option('--no-eslint', 'Skip ESLint configuration')
.option('--no-prettier', 'Skip Prettier configuration')
.option('--no-editorconfig', 'Skip .editorconfig')
.option('-y, --yes', 'Accept defaults for any unprovided options (skip prompts)')
```

### Modify `runPrompts()` to accept pre-filled values

```typescript
export const runPrompts = async (
  suggestedPackageName: string,
  gitConfig: GitConfig | null,
  silent: boolean,
  cliOptions?: Record<string, string | boolean>  // NEW parameter
): Promise<PromptAnswer[]> => {

  // If --yes flag or --silent, build answers from CLI flags + defaults
  if (silent || cliOptions?.yes) {
    return getDefaultAnswers(suggestedPackageName, gitConfig, cliOptions);
  }

  // Otherwise, run interactive prompts as before
  // but pre-fill initial values from cliOptions where provided
  // ...
```

### Behavior

| Scenario | Result |
|----------|--------|
| No flags | Interactive prompts (current behavior, unchanged) |
| `--yes` only | All defaults, plugin name from folder |
| `--name foo --display-name "Foo" --yes` | Uses provided values, defaults for the rest |
| `--name foo --display-name "Foo"` (no `--yes`) | Prompts only for missing values, pre-fills provided ones |
| `--silent` | Same as `--yes` but also suppresses log output (current behavior, but now respects flags) |

### Example usage after the change

```bash
# Fully non-interactive — what AI agents and CI need
npx @strapi/sdk-plugin@latest init ./my-plugin \
  --name strapi-plugin-color-picker \
  --display-name "Color Picker" \
  --description "Pick colors with a visual color wheel" \
  --yes \
  --use-npm \
  --no-install

# Partial flags — prompts only for what's missing
npx @strapi/sdk-plugin@latest init ./my-plugin \
  --name strapi-plugin-color-picker \
  --display-name "Color Picker"

# Quick scaffold with all defaults (like npm init -y)
npx @strapi/sdk-plugin@latest init ./my-plugin --yes
```

## Implementation Details

The change touches 3 files:

### 1. `src/cli/commands/plugin/init/command.ts`

Add the new `.option()` calls and pass them through to the action:

```typescript
.option('--name <name>', 'Plugin package name')
.option('--display-name <name>', 'Plugin display name')
.option('--description <desc>', 'Plugin description')
.option('-y, --yes', 'Accept defaults for unprovided options')
// ... etc
.action((path, options) => {
  return action(path, options, ctx);
});
```

### 2. `src/cli/commands/plugin/init/action.ts`

Pass the new options through to `init()`:

```typescript
const answers = await init({
  cwd,
  path: pluginPath,
  silent,
  debug,
  logger,
  cliOptions: {           // NEW
    name: options.name,
    displayName: options.displayName,
    description: options.description,
    yes: options.yes,
    // ... etc
  },
});
```

### 3. `src/cli/commands/utils/init/prompts.ts`

Update `getDefaultAnswers()` to merge CLI-provided values:

```typescript
const getDefaultAnswers = (
  suggestedPackageName: string,
  gitConfig: GitConfig | null,
  cliOptions?: Record<string, string | boolean>
): PromptAnswer[] => {
  return [
    { name: 'pkgName', answer: cliOptions?.name ?? suggestedPackageName },
    { name: 'pluginId', answer: cliOptions?.pluginId ?? cliOptions?.name ?? suggestedPackageName },
    { name: 'displayName', answer: cliOptions?.displayName ?? '' },
    { name: 'description', answer: cliOptions?.description ?? '' },
    { name: 'authorName', answer: cliOptions?.authorName ?? gitConfig?.user?.name ?? '' },
    { name: 'authorEmail', answer: cliOptions?.authorEmail ?? gitConfig?.user?.email ?? '' },
    { name: 'repo', answer: cliOptions?.repoUrl ?? '' },
    { name: 'license', answer: cliOptions?.license ?? 'MIT' },
    { name: 'client-code', answer: cliOptions?.admin !== false },
    { name: 'server-code', answer: cliOptions?.server !== false },
    { name: 'editorconfig', answer: cliOptions?.editorconfig !== false },
    { name: 'eslint', answer: cliOptions?.eslint !== false },
    { name: 'prettier', answer: cliOptions?.prettier !== false },
    { name: 'typescript', answer: cliOptions?.typescript !== false },
  ];
};
```

## Precedent

This pattern is standard across the Node.js ecosystem:

| Tool | Non-interactive flag |
|------|---------------------|
| `npm init` | `-y` / `--yes` |
| `create-next-app` | `--yes --typescript --app` |
| `create-vite` | `--template react-ts` |
| `create-strapi-app` | `--quickstart` |
| `yarn init` | `-y` |
| `pnpm init` | (non-interactive by default) |
| `create-react-app` | `--template typescript` |

Strapi's own `create-strapi-app` already supports `--quickstart` for non-interactive mode. The SDK plugin CLI should follow the same pattern.

## Impact

- **Zero breaking changes** — all existing behavior is preserved; flags are purely additive
- **Minimal code change** — ~50 lines across 3 files
- **Enables AI agent tooling** — Claude Code, Copilot, Cursor, and other agents can scaffold plugins
- **Enables CI/CD** — automated plugin scaffolding in pipelines
- **Enables scripting** — shell scripts and other tools can programmatically create plugins
- **Backward compatible** — `--silent` continues to work as before, but now also respects the new flags
