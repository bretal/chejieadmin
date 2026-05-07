# Glass Theme Design

## Goal

Rework the admin UI so it visually matches the Ant Design homepage glass theme direction, not just the copied token configuration. The result should feel glassy at every visible layer: page background, layout shell, data containers, overlays, and small controls such as buttons and inputs.

## Root Cause

The current project already uses `src/glassTheme.ts`, but the copied official theme only covers a subset of Ant Design components. The app is a data-heavy admin interface, so most of what users see is `Layout`, `Menu`, `Table`, pagination, tags, and action buttons. Those are not fully covered by the official homepage preview theme.

The current app also uses a dark purple background and hard-coded dark text/card styles. That makes the UI attractive, but it does not reproduce the official homepage's light glass look. `backdrop-filter` needs a layered, visible background behind components; otherwise glass styles read as flat translucent panels.

## Recommended Approach

Implement a site-wide component-level glass system.

1. Replace the dark global background with a light multi-layer gradient similar to the Ant Design homepage preview area.
2. Convert the app layout to a light glass shell: sidebar, header, menu items, and content viewport should all use translucent backgrounds, blur, inner glow, and soft shadows.
3. Keep the official `glassTheme.ts` base, then extend it for admin-heavy components: `Table`, `Pagination`, `Menu`, `Tag`, `Form`, `Typography`, and additional button states.
4. Add global CSS fallbacks for component internals that `ConfigProvider` cannot fully target through `classNames`.
5. Remove or neutralize page-level hard-coded dark styling where it conflicts with the new theme.

## Component Coverage

Small components are in scope. `Button`, `Input`, `Input.Search`, `Input.TextArea`, `InputNumber`, `Select`, `DatePicker`, `Switch`, `Radio.Button`, `Segmented`, `ColorPicker`, `Tag`, `Pagination`, `Popover`, `Popconfirm`, dropdowns, modal controls, and table action buttons should all show glass behavior.

Button variants keep semantic meaning:

- Default buttons use transparent glass with neutral text.
- Primary buttons use blue tinted glass instead of a fully solid fill.
- Danger buttons use red tinted glass instead of a fully solid fill.
- Hover and active states increase tint and shadow without becoming opaque.
- Disabled states remain readable but visually muted.

## Visual Rules

Use a consistent set of glass primitives:

- Translucent surface: `color-mix(... transparent)` or rgba fallback.
- Blur: `backdrop-filter: blur(...)` with `-webkit-backdrop-filter`.
- Border: subtle white/translucent stroke.
- Depth: soft outer shadow plus inner highlight.
- Background: light radial gradients that remain visible behind surfaces.

## Verification

Build must pass with `npm run build`.

Manual checks should cover:

- Dashboard cards.
- At least one table page.
- Search input and primary action button.
- Modal with form controls.
- Select dropdown.
- Popconfirm or dropdown overlay.
- Pagination and table hover state.

## Non-goals

This does not change data fetching, routing, API contracts, or business behavior. The change is visual only.
