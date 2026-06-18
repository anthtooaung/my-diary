# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack
- **Frontend**: React 19 + Vite 8, React Router 7, TanStack Query 5
- **Styling**: Tailwind CSS 4 + shadcn/ui (`radix-lyra` style, neutral base)
- **Icons**: Phosphor Icons (primary), Lucide Icons (secondary)
- **Backend**: Express 5 + better-sqlite3 (single-file SQLite at `data/diary.db`)
- **Auth**: Bearer token, single-user (password in `settings` table, token in `localStorage` as `diary_token`)

> Zustand 5 (`useDiaryStore` — sidebar state), react-hook-form (all forms), and zod (schemas in `src/lib/schemas.js`) are now integrated and used throughout the codebase.

## Commands
```bash
npm run dev          # Vite dev server → :5173, proxies /api → :3000
npm run dev:server   # Express API → :3000 (auto-creates data/ if missing)
npm run build        # Production build → dist/
npm start            # Production: node server.js (serves API + dist/ + SPA fallback)
```

## Architecture

### Production serving
`server.js` serves the built React app from `dist/` at the project root. When `dist/` exists, Express acts as static file server with SPA fallback — all non-API routes serve `dist/index.html`. When `dist/` is absent (dev mode), only the API runs; Vite proxies `/api` to it.

### Component tree
```
<AuthProvider>            ← token state + localStorage sync + /login /logout
  <Routes>
    "/" → <LoginPage />   ← redirects to /dashboard if already authenticated
    <ProtectedRoute>      ← loading spinner → Navigate("/") on unauth
      <AppLayout>         ← sidebar (w-56) + scrollable <main> with <Outlet />
        "/dashboard"      → textarea + mood selector + EntryCard list
        "/calendar"       → month grid (MoodDot per day) + clicked-day detail
        "/goals"          → filter tabs + GoalCard list (active/completed sections)
        "/digest"         → week picker + client-side mood/themes/highlight analysis
        "/search"         → keyword search (API `?q=`) + snippet extraction
        "/settings"       → password change + JSON export + sign out
```

### Data fetching pattern
Pages use TanStack Query inline — no extracted hooks in `src/hooks/` yet (the directory is empty). `api.js` is the single fetch wrapper: auto-attaches `Bearer <token>`, returns parsed JSON, and on 401 clears localStorage and redirects to `/`.

### Styling
Tailwind utility classes only — no CSS modules, no CSS-in-JS. The shadcn theme uses CSS custom properties in `src/index.css` with full light (default) and dark (`.dark`) variants. The font is JetBrains Mono Variable applied globally to `html`.

### Icons convention
```jsx
import { House } from '@phosphor-icons/react'
<House weight="duotone" className="w-5 h-5" />    // sidebar nav icons
<House weight="fill" className="w-4 h-4" />        // active/selected state
<House weight="bold" className="w-4 h-4" />        // button icons
```

## Moods
Centralized in `src/lib/moods.js` — the single source of truth. Exports `MOODS` (object), `MOOD_LIST` (flat array), `POSITIVE_MOODS`, and `getMood(value)` lookup.
| Value | Color | Icon |
|-------|-------|------|
| `happy` | emerald | `Smiley` |
| `neutral` | amber | `SmileyMeh` |
| `sad` | blue | `SmileySad` |
| `anxious` | orange | `SmileyNervous` |
| `angry` | red | `SmileyAngry` |
| `exhausted` | purple | `SmileyXEyes` |

## Form Validation
All forms use **react-hook-form** + **zod** via `@hookform/resolvers`. Schemas are defined in `src/lib/schemas.js`:
- `loginSchema` — password login form
- `passwordChangeSchema` — password change with match validation
- `entrySchema` — diary entry (content + optional mood)
- `goalSchema` — goal creation/editing (title + category + optional deadline)
`GOAL_CATEGORIES` (`['weekly', 'monthly', 'yearly']`) is also exported from schemas.

## State Management
- **Auth**: `useAuth()` from `@/contexts/AuthContext` for token and login/logout
- **Sidebar / Global UI**: `useDiaryStore` from `@/stores/useDiaryStore` (Zustand) — currently holds `sidebarOpen` + `openSidebar`/`closeSidebar`/`toggleSidebar` actions
- **Server state**: TanStack Query for all API data (entries, goals, settings)

## Database
- `data/diary.db` — auto-created on first server run, gitignored
- Tables: `entries` (id, content, mood, created_at), `goals` (id, title, category, deadline, status, created_at), `settings` (key, value)
- Default password: `admin` (stored in `settings` where key='password')
- Token stored as `settings.key = 'session_token'`

## Dev Tools

### MCPs (installed)
| Name | What It Does |
|------|-------------|
| `context7` | Pulls current library docs (React 19, TanStack Query 5, Tailwind 4, Express 5) |
| `claude-mem` | Remembers architecture decisions between sessions |

### Skills
| Name | What It Does |
|------|-------------|
| `/seed-entries` | Inserts 2-4 weeks of realistic diary entries + goals via the API |

### Agents
| Name | What It Does |
|------|-------------|
| `ui-reviewer` | Reviews pages for visual consistency, state handling (loading/empty/error), dark mode, responsive |
| `code-auditor` | Scans for bugs, missing error handling, input validation, React anti-patterns |

## Knowledge files
- `knowledges/listToDo.md` — **archived** vanilla JS plan (superseded)
- `knowledges/project-flow.md` — user journeys and original architecture (some sections outdated)
- `knowledges/react-migration-plan.md` — migration plan now **complete**; useful for understanding original intent
- `knowledges/refactor-zod-zustand-mood-centralization.md` — 2026-06-18 refactor details: Zod schemas, mood centralization, Zustand sidebar store
- `knowledges/daily-log.md` — running log of completed tasks by date + planned next work
- `knowledges/feature-ideas.md` — full feature backlog in 3 tiers, with implementation notes

## Conventions
- File extension: `.jsx` only (no TypeScript)
- Path alias: `@/` → `src/`
- Named exports, one component per file
- `cn()` from `@/lib/utils` for merging Tailwind classes
- `useAuth()` from `@/contexts/AuthContext` for auth state
- `api` object from `@/api` for all server calls
