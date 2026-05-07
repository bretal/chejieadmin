# Glass Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the admin UI reproduce the Ant Design homepage glass style across layout, containers, and small controls.

**Architecture:** Keep the existing React/Vite/Ant Design app structure. Extend `src/glassTheme.ts` for ConfigProvider-supported component slots, use `src/index.css` for component internals that Ant Design does not expose through classNames, and simplify page-level hard-coded dark styles so the global glass system can take effect.

**Tech Stack:** React 19, Ant Design 6, `antd-style`, Vite, TypeScript, CSS custom properties.

---

## File Structure

- Modify `src/index.css`: global light gradient background, shared glass variables, AntD internal component overrides.
- Modify `src/glassTheme.ts`: extend glass primitives and component `classNames` for small controls, tables, menus, tags, typography, pagination, and overlays.
- Modify `src/components/GlassLayout/index.tsx`: convert the app shell from dark glass to light homepage-like glass.
- Modify page files under `src/pages`: remove conflicting hard-coded dark text/background styles where they block the global theme.
- Use `npm run build` for verification.

## Task 1: Global Glass Foundation

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Replace the global dark background with a light layered background**

Set `body` to a light multi-radial background with fixed attachment, define glass CSS variables, and keep scrollbars subtle.

- [ ] **Step 2: Add AntD internal CSS overrides**

Cover internals for `Table`, `Menu`, `Pagination`, `Tag`, `Modal`, `Dropdown`, `Select`, `Input`, `Button`, `Popconfirm`, `Tooltip`, and table hover states. These rules should avoid business behavior changes and only adjust visual style.

- [ ] **Step 3: Verify CSS parses**

Run: `npm run build`

Expected: TypeScript and Vite build complete successfully.

## Task 2: ConfigProvider Theme Extension

**Files:**
- Modify: `src/glassTheme.ts`

- [ ] **Step 1: Add reusable glass primitives**

Add light-surface, primary-surface, danger-surface, border, and focus-ring style objects in `useStyles`.

- [ ] **Step 2: Extend component coverage**

Add or refine ConfigProvider entries for `table`, `menu`, `pagination`, `tag`, `typography`, `form`, `tooltip`, and `popconfirm`. Keep existing official entries for cards, buttons, inputs, select, date picker, popover, segmented, radio, and progress.

- [ ] **Step 3: Make button variants glass**

Default, primary, and danger buttons should all use translucent glass. Primary and danger keep color semantics through tinted backgrounds and borders, not solid fills.

- [ ] **Step 4: Build**

Run: `npm run build`

Expected: build passes.

## Task 3: Layout Shell

**Files:**
- Modify: `src/components/GlassLayout/index.tsx`

- [ ] **Step 1: Convert Layout, Sider, Header, and Content to light glass**

Remove `theme="dark"` from `Menu`, replace dark inline colors with token-friendly neutral colors, and use translucent light surfaces for sidebar/header.

- [ ] **Step 2: Make content area show the background**

Keep `Content` transparent enough that nested glass panels blur over the page background.

- [ ] **Step 3: Build**

Run: `npm run build`

Expected: build passes.

## Task 4: Page-Level Conflict Cleanup

**Files:**
- Modify: `src/pages/Dashboard/index.tsx`
- Modify: `src/pages/Brand/index.tsx`
- Modify: other `src/pages/*/index.tsx` files only where they hard-code dark colors or opaque backgrounds.

- [ ] **Step 1: Remove dashboard dark card styles**

Let the global card and typography theme control dashboard cards. Keep icon accent colors.

- [ ] **Step 2: Remove table/page dark overrides**

Remove inline `background: rgba(255,255,255,0.03)` and hard-coded `#e8e8ed`/`#a0a0b0` where they conflict with the light glass target.

- [ ] **Step 3: Build**

Run: `npm run build`

Expected: build passes.

## Task 5: Verification

**Files:**
- No code changes unless verification reveals a visual blocker.

- [ ] **Step 1: Run production build**

Run: `npm run build`

Expected: build passes.

- [ ] **Step 2: Check lints for edited files**

Use IDE lint diagnostics on edited files. Fix introduced diagnostics if any are clear.

- [ ] **Step 3: Manual visual checklist**

Check dashboard, one table page, a modal form, search input, primary button, danger action button, select popup, popconfirm, pagination, and table row hover. Each should show translucent background, highlight border, and soft shadow instead of solid default AntD surfaces.

## Self-Review

- Spec coverage: Tasks cover background, layout shell, large containers, small controls, overlays, hard-coded style cleanup, and verification.
- Placeholder scan: No TBD/TODO placeholders remain.
- Type consistency: All referenced files and Ant Design component names match the current project structure.
