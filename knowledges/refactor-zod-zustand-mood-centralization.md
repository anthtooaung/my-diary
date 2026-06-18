# Refactor: Zod Validation, Mood Centralization & Zustand Sidebar State

**Date**: June 18, 2026  
**Commits**: `55a4f21` + `476f319`

---

## Overview

Two-phase refactor that (1) modernizes all form handling across the app with react-hook-form + Zod validation and centralizes mood configuration, and (2) lifts mobile sidebar state from local `useState` into a global Zustand store.

---

## Phase 1 — Zod Validation & Mood Centralization (`55a4f21`)

### Problem

- Every page had its own `useState`-based form handling with ad-hoc inline validation (`if (!content.trim()) return`).
- Mood configuration (6 moods with colors, icons, labels) was **duplicated in 3 files**: `MoodBadge.jsx`, `MoodDot.jsx`, and `DashboardPage.jsx`.
- The `"positive"` mood list `['happy', 'neutral']` was hardcoded in `DigestPage.jsx` and `CalendarPage.jsx`.
- No library-level validation for any form — password rules, goal creation, entry creation all checked manually.

### What Changed

#### New Files

| File | Purpose |
|------|---------|
| `src/lib/moods.js` | Single source of truth for all 6 moods — each with `value`, `label`, `icon`, `dotClass`, `badgeClass`. Exports `MOODS` (object), `MOOD_LIST` (flat array), `POSITIVE_MOODS`, and `getMood(value)` lookup. |
| `src/lib/schemas.js` | Zod validation schemas for every form in the app. Also exports `GOAL_CATEGORIES` constant. |

#### Schemas Defined

| Schema | Fields | Special Rules |
|--------|--------|---------------|
| `loginSchema` | `password: string` | min 1 char |
| `passwordChangeSchema` | `currentPassword`, `newPassword`, `confirm` | min 4 chars; `newPassword === confirm` (via `.refine()`) |
| `entrySchema` | `content: string`, `mood: enum(optional)` | min 1 for content; mood defaults to `''` |
| `goalSchema` | `title: string`, `category: enum(weekly/monthly/yearly)`, `deadline: string(optional)` | min 1 for title |

#### Pages Migrated to react-hook-form

| Page | Form | Validation | Key Changes |
|------|------|------------|-------------|
| **LoginPage** | Password login | `loginSchema` | `useForm` + `zodResolver`; separated `serverError` from field `errors`; disabled state uses `isValid` instead of `!password.trim()` |
| **DashboardPage** | New entry (content + mood) | `entrySchema` | `useForm` + `zodResolver`; `useWatch` for mood toggle; `setValue` for mood buttons; submit button disabled via `isValid`; `reset()` on success |
| **GoalsPage** | Create/edit goal | `goalSchema` | `useForm` + `zodResolver`; `reset()` for form clear and editing pre-fill; category/date via `register()`; `GOAL_CATEGORIES` constant used in filter tabs too |
| **SettingsPage** | Password change | `passwordChangeSchema` | `useForm` + `zodResolver`; removed all manual `if` validation blocks; `reset()` on success; export errors moved to separate `exportError` state |

#### Components Updated

| Component | Before | After |
|-----------|--------|-------|
| `MoodBadge.jsx` | Had its own inline `moodConfig` object with icon + className per mood | Calls `getMood(mood)` from `@/lib/moods`; uses `badgeClass` from centralized config |
| `MoodDot.jsx` | Had its own inline `dotColors` object | Calls `getMood(mood)` from `@/lib/moods`; uses `dotClass` and `label` from centralized config |

#### Pages with Minor Updates

- **DigestPage.jsx** — replaced inline `['happy', 'neutral']` with imported `POSITIVE_MOODS` constant.

#### Dependencies Added

```json
"@hookform/resolvers": "^5.4.0"
```

(Zod and react-hook-form were already in `package.json` but unused until now.)

### Architecture Decisions

- **Mood config lives in `src/lib/moods.js`** — a plain module, not a store. Moods don't change at runtime, so a Zustand store would be overkill. Every component that needs mood data imports from here.
- **Schemas separate from moods** — `src/lib/schemas.js` depends on `moods.js` (to derive the enum of valid mood values), but they're separate files because schemas also include non-mood forms (login, password change, goals).
- **`GOAL_CATEGORIES` exported from schemas** — it's used by both the Zod schema (for `.enum()`) and the GoalsPage UI (filter tabs). Keeping it in schemas makes it the authority; both the validator and the UI read from one place.
- **Server errors kept separate from field errors** — `serverError` / `passwordMutation.isError` are distinct from `errors.fieldName` from react-hook-form. Field-level validation lives in Zod; server-rejected passwords or network failures are separate UI state.

---

## Phase 2 — Zustand Sidebar State (`476f319`)

### Problem

The sidebar's mobile open/close state was local `useState` inside `AppLayout`. This meant:
- `onNavigate` callback had to be passed down as a prop from `AppLayout` → `Sidebar`.
- If any other component (e.g., a floating button on a page) needed to open/close the sidebar, it couldn't — the state was trapped in `AppLayout`.
- The `X` close button in the mobile overlay was never wired because `Sidebar` didn't have access to the close function without the prop.

### What Changed

#### New File: `src/stores/useDiaryStore.js`

```js
import { create } from 'zustand'

export const useDiaryStore = create((set) => ({
  sidebarOpen: false,
  openSidebar:  () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}))
```

A single Zustand store for global diary UI state. Currently holds only `sidebarOpen`, but structured to grow (dark mode toggle, any future global UI state).

#### Changes to `AppLayout.jsx`

- Removed `import { useState } from 'react'` and `import { X } from '@phosphor-icons/react'` (unused).
- Replaced `const [mobileOpen, setMobileOpen] = useState(false)` with selectors from `useDiaryStore`.
- Backdrop `onClick` now calls `closeSidebar()` directly.
- Mobile header hamburger button calls `openSidebar()`.
- No longer passes `onNavigate` prop to `<Sidebar />`.

#### Changes to `Sidebar.jsx`

- Removed `onNavigate` prop from signature.
- Imports `useDiaryStore` and calls `closeSidebar` on every `NavLink` click — so navigating closes the mobile sidebar automatically.

### Architecture Decisions

- **Single store named `useDiaryStore`** rather than `useSidebarStore` — anticipates future global UI state (e.g., theme toggle, panel state) living in the same store, avoiding many tiny stores.
- **Selective subscription** — components use `useDiaryStore((s) => s.sidebarOpen)` not `useDiaryStore()`, so they only re-render when their specific slice changes.
- **Not persisted** — sidebar state resets on page load (closed by default), which is correct for a mobile overlay.

---

## Summary of Impact

| Area | Before | After |
|------|--------|-------|
| Mood config | Duplicated in 3 files | Single source in `src/lib/moods.js` |
| Form validation | Manual `if` checks per page | Zod schemas via `react-hook-form` + `@hookform/resolvers` |
| Form state | `useState` per field per page | `useForm()` with `register()`, centralized defaults, `reset()` |
| Sidebar state | Local `useState` in `AppLayout`, prop-drilled | Global Zustand store, any component can read/write |
| Error display | Mixed server + field errors in one state | Field errors from `formState.errors`, server errors separate |
| Submit button disable | `!field.trim()` per field | `isValid` from react-hook-form |
| "Positive" mood list | Hardcoded `['happy', 'neutral']` in DigestPage | Imported `POSITIVE_MOODS` constant |
| Goal categories | Inline `['weekly', 'monthly', 'yearly']` array | Imported `GOAL_CATEGORIES` constant, shared with Zod schema |
