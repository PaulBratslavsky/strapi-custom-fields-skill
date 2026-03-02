# Strapi Custom Field — UI Layout Guide

Rules for building custom field React components that look native inside Strapi's admin panel. Follow these strictly.

## Core Principles

1. **Use Strapi's design tokens** — never hardcode colors, spacing, or font sizes. Always reference `theme.colors.*`, `theme.spaces.*`, `theme.fontSizes.*`.
2. **Use `styled-components` for all layout CSS** — Strapi's `Box`/`Flex` props are unreliable for `width`, `overflow`, `flex`, `position`, and `display: grid`. Always use `styled-components` when these properties matter.
3. **Never use absolute pixel values for sizing** — no `min-width: 180px`, no `height: 400px`, no `padding: 32px`. Use theme tokens (`theme.spaces[4]`) or relative units (`100%`, `auto`, `1fr`).
4. **Visual previews go above controls** — if the field has a preview (video, map, image), render it at the top at full width, controls below.
5. **Never use inline `style` props** — always use `styled-components`.

## Standard Layout Components

Every custom field component should use these reusable styled-components for consistent layout:

```typescript
import styled from "styled-components";

/** Full-width vertical stack — the outermost wrapper inside Field.Root */
const FieldColumn = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaces[3]};
`;

/** Ensures a child stretches full width */
const FieldRow = styled.div`
  width: 100%;
`;

/** Two side-by-side inputs of equal width */
const SideBySideRow = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spaces[4]};
`;
```

## Compound Container Pattern

For fields with a toolbar + main content area (editors, maps, embeds), wrap everything in a single bordered container with internal sections:

```typescript
/** Outer container — single border, single radius, groups everything */
const Container = styled.div`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.neutral200};
  border-radius: ${({ theme }) => theme.borderRadius};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.neutral0};
`;

/** Toolbar area — subtle background, bottom border separates from content */
const Toolbar = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spaces[3]};
  padding: ${({ theme }) => `${theme.spaces[2]} ${theme.spaces[3]}`};
  background: ${({ theme }) => theme.colors.neutral100};
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral200};
`;

/** Content area that fills remaining space */
const ContentArea = styled.div`
  width: 100%;
`;
```

### Usage:
```tsx
<Container>
  <Toolbar>
    <SingleSelect ... />
    <Typography ...>metadata</Typography>
  </Toolbar>
  <ContentArea>
    {/* editor, map, embed, etc. */}
  </ContentArea>
</Container>
```

## Preview Pattern (for embeds, videos, maps)

```typescript
/** Theme-aware preview wrapper */
const PreviewWrapper = styled.div`
  width: 100%;
  background: ${({ theme }) => theme.colors.neutral100};
  border: 1px solid ${({ theme }) => theme.colors.neutral200};
  border-radius: ${({ theme }) => theme.borderRadius};
  overflow: hidden;
`;

/** 16:9 responsive iframe container */
const ResponsiveIframeContainer = styled.div`
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
  }
`;

/** Empty state when no content to preview */
const EmptyPreview = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => `${theme.spaces[6]} ${theme.spaces[4]}`};
  color: ${({ theme }) => theme.colors.neutral500};
`;
```

## Third-Party Widget Integration

When embedding third-party widgets (Monaco, maps, rich editors), they often don't respect CSS `width: 100%` on their own. Fix this with:

```typescript
const WidgetWrapper = styled.div`
  width: 100%;

  /* Override the widget's internal container to fill width */
  & > div,
  & > div > div {
    width: 100% !important;
  }
`;
```

For specific widgets, target their class names:
```typescript
/* Monaco editor */
& .react-monaco-editor-container { width: 100% !important; }
& .monaco-editor { width: 100% !important; }

/* Leaflet maps */
& .leaflet-container { width: 100% !important; height: 100% !important; }
```

## Design System Props — What's Safe vs Unreliable

### Safe to use on `Box`/`Flex`:
- `padding`, `paddingTop`, `paddingLeft`, `paddingRight`, `paddingBottom`
- `background`, `borderColor`, `hasRadius`
- `gap`, `direction` (on Flex)
- `marginTop`, `marginBottom`

### UNRELIABLE — use `styled-components` instead:
- `width`, `height`, `minWidth`, `maxWidth`
- `overflow`
- `flex`, `flexGrow`, `flexShrink`
- `position`, `top`, `left`, `right`, `bottom`
- `display` (e.g., `display="grid"`)
- Percentage-based `paddingTop` (aspect ratio trick)

## Spacing Reference

Always use `theme.spaces[n]` instead of pixel values:

| Token | Value |
|-------|-------|
| `theme.spaces[1]` | 4px |
| `theme.spaces[2]` | 8px |
| `theme.spaces[3]` | 12px |
| `theme.spaces[4]` | 16px |
| `theme.spaces[5]` | 20px |
| `theme.spaces[6]` | 24px |
| `theme.spaces[8]` | 32px |
| `theme.spaces[10]` | 40px |

## Color Reference

Use `theme.colors.*` for all colors:

| Token | Use case |
|-------|----------|
| `neutral0` | White background |
| `neutral100` | Subtle background (toolbars, empty states) |
| `neutral150` | Slightly darker background |
| `neutral200` | Borders |
| `neutral500` | Muted text |
| `neutral600` | Secondary text |
| `neutral800` | Primary text |
| `primary600` | Interactive/accent |
| `danger600` | Error states |

## Anti-Patterns — Never Do These

1. **No pixel values for spacing** — use `theme.spaces[n]`
2. **No pixel values for sizing** — use `100%`, `auto`, `1fr`, or `theme.spaces[n]`
3. **No hardcoded colors** — use `theme.colors.*`
4. **No inline `style` props** — use `styled-components`
5. **No `Box`/`Flex` for layout-critical CSS** — use `styled-components`
6. **No wrapping everything in padded `Box`** — use `styled-components` with theme tokens
7. **No controls above previews** — preview content always goes first
8. **No separate borders for toolbar and content** — use a single `Container` with internal `border-bottom`

## Component Structure Template

```tsx
<Field.Root name={name} error={error} hint={description?.defaultMessage} required={required}>
  <Field.Label>{intlLabel?.defaultMessage ?? "Field Name"}</Field.Label>

  <FieldColumn>
    {/* Option A: Simple field — just inputs */}
    <FieldRow>
      <TextInput ... />
    </FieldRow>

    {/* Option B: Compound field — toolbar + content */}
    <Container>
      <Toolbar>
        {/* controls: selects, buttons, metadata */}
      </Toolbar>
      <ContentArea>
        {/* main content: editor, preview, map */}
      </ContentArea>
    </Container>

    {/* Option C: Preview + inputs */}
    <PreviewWrapper>
      {/* visual preview */}
    </PreviewWrapper>
    <FieldRow>
      {/* inputs below preview */}
    </FieldRow>
  </FieldColumn>

  <Field.Hint />
  <Field.Error />
</Field.Root>
```
