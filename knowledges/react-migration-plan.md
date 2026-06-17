# My Diary — React + Vite Migration Plan

> Combines the original vanilla-JS roadmap (`listToDo.md`) with a React + Vite
> rebuild. The backend and CSS stay. The frontend gets rebuilt in React.

---

## Why React + Vite

The backend is done. The CSS is done. The frontend is barely started — 1
working page (login), 1 HTML skeleton (dashboard), 5 missing pages, 7 missing
JS files. Since every page is interactive and stateful, React gives us:

- Component reuse (sidebar, entry cards, mood badges, empty states)
- Centralized auth state (no token plumbing in every file)
- React Router (real SPA navigation, no hard page reloads)
- Vite dev server with API proxy (hot reload, fast builds)

The backend and CSS are ported as-is. Nothing in `server.js` changes except
the static file path at the bottom.

---

## Step 0 — Scaffold the Vite Project

```bash
cd "/home/pc/Documents/AI vibe coding/diary-app"
npm create vite@latest client -- --template react
cd client
npm install
npm install react-router-dom
```

This creates `client/` with standard Vite + React scaffolding.

---

## Target Directory Structure

```
diary-app/
├── server.js              # UNCHANGED except static path
├── package.json           # keep (server deps)
├── data/                  # SQLite DB at runtime
├── .mcp.json              # keep
├── CLAUDE.md              # update stack + conventions
├── .gitignore             # add client/node_modules, client/dist
│
├── knowledge/
│   ├── listToDo.md        # original roadmap (archive reference)
│   ├── project-flow.md    # architecture docs (still relevant)
│   └── react-migration-plan.md  # THIS FILE
│
└── client/                # NEW — Vite React app
    ├── index.html
    ├── vite.config.js
    ├── package.json
    ├── public/
    │   └── favicon.svg
    └── src/
        ├── main.jsx               # React root + BrowserRouter
        ├── App.jsx                # Route definitions
        ├── api.js                 # fetch wrapper + auth header
        ├── contexts/
        │   └── AuthContext.jsx     # token, login/logout, auto-redirect
        ├── hooks/
        │   ├── useEntries.js      # entries CRUD
        │   ├── useGoals.js        # goals CRUD
        │   └── useMoods.js        # mood data fetch
        ├── components/
        │   ├── Sidebar.jsx         # nav + logout
        │   ├── EntryCard.jsx       # single entry
        │   ├── MoodBadge.jsx       # colored mood pill
        │   ├── MoodDot.jsx         # tiny calendar dot
        │   ├── GoalCard.jsx        # single goal
        │   ├── EmptyState.jsx      # reusable empty state
        │   └── ProtectedRoute.jsx  # auth guard
        ├── pages/
        │   ├── LoginPage.jsx       # password → token
        │   ├── DashboardPage.jsx   # write + recent entries
        │   ├── CalendarPage.jsx    # month grid + day detail
        │   ├── GoalsPage.jsx       # CRUD + timeline
        │   ├── DigestPage.jsx      # week picker + AI summary
        │   ├── SearchPage.jsx      # keyword search + results
        │   └── SettingsPage.jsx    # password, export, logout
        └── styles/
            └── index.css           # copy of existing style.css
```

---

## Component Tree

```
<BrowserRouter>
  <AuthProvider>
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>        ← Sidebar + <Outlet />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/digest" element={<DigestPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  </AuthProvider>
</BrowserRouter>
```

- **AuthProvider** — manages token in state + localStorage, exposes
  `login()`, `logout()`, `token`, `isAuthenticated`.
- **ProtectedRoute** — checks `isAuthenticated`, redirects to `/` if not
  logged in.
- **AppLayout** — renders sidebar + `<Outlet />` for the active page.

---

## Data Flow

```
[Page Component]
    │
    ▼
[Custom Hook]   ← useEntries(), useGoals(), useMoods()
    │
    ▼
[api.js]        ← fetch wrapper, injects Authorization header,
    │              handles 401 → auto-logout, parses JSON
    ▼
[Express API]   ← localhost:3000/api/*
    │
    ▼
[SQLite]
```

- `api.js` is a single module. Every call attaches `Bearer <token>` from
  context. On 401, it calls `logout()` and redirects to `/`.
- Custom hooks encapsulate state + API calls. Each returns
  `{ data, loading, error, refetch }` or CRUD functions.
- No Redux / Zustand needed — hooks + context are enough for a single-user
  app.

---

## Auth Flow (Reactified)

```
1. App mounts → AuthProvider checks localStorage for 'diary_token'.
2. If token exists → GET /api/entries?limit=1 to verify.
    200 → set isAuthenticated = true, render protected routes.
    401 → clear token, show LoginPage.
3. LoginPage → POST /api/login → store token in localStorage + context.
4. Logout → POST /api/logout → clear localStorage + context → redirect to /.
```

---

## Vite Config

```js
// client/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  build: {
    outDir: 'dist',
  },
});
```

During dev, Vite proxies `/api/*` to Express on port 3000. In production,
Express serves the built `client/dist/` folder.

---

## CSS Migration

1. Copy `public/css/style.css` → `client/src/styles/index.css`.
2. Import in `main.jsx`: `import './styles/index.css'`.
3. Use className strings from the existing stylesheet — no CSS-in-JS or
   Tailwind needed. The dark theme is already complete.

No changes to the CSS custom properties or class names. The existing styles
for `.sidebar`, `.card`, `.entry-card`, `.goal-card`, `.calendar-grid`,
`.mood-badge`, `.digest-card`, `.search-results`, `.empty-state`, `.btn`,
`.timeline`, etc. all port directly.

---

## Build Order (from the original roadmap, adapted for React)

### Phase 1 — Foundation
| # | Task | Files | Priority |
|---|------|-------|----------|
| 1 | Scaffold Vite project | `client/` scaffolding | P0 |
| 2 | Vite config + proxy | `vite.config.js` | P0 |
| 3 | CSS port | `src/styles/index.css` | P0 |
| 4 | API wrapper | `src/api.js` | P0 |

### Phase 2 — Auth + Navigation
| # | Task | Files | Priority |
|---|------|-------|----------|
| 5 | AuthContext | `src/contexts/AuthContext.jsx` | P0 |
| 6 | ProtectedRoute | `src/components/ProtectedRoute.jsx` | P0 |
| 7 | LoginPage | `src/pages/LoginPage.jsx` | P0 |
| 8 | Sidebar + AppLayout | `src/components/Sidebar.jsx`, `src/App.jsx` | P0 |

### Phase 3 — Dashboard (Write & View Entries)
| # | Task | Files | Priority |
|---|------|-------|----------|
| 9 | useEntries hook | `src/hooks/useEntries.js` | P0 |
| 10 | EntryCard component | `src/components/EntryCard.jsx` | P0 |
| 11 | MoodBadge component | `src/components/MoodBadge.jsx` | P0 |
| 12 | EmptyState component | `src/components/EmptyState.jsx` | P0 |
| 13 | DashboardPage | `src/pages/DashboardPage.jsx` | P0 |

### Phase 4 — Calendar + Emotion Timeline
| # | Task | Files | Priority |
|---|------|-------|----------|
| 14 | useMoods hook | `src/hooks/useMoods.js` | P1 |
| 15 | MoodDot component | `src/components/MoodDot.jsx` | P1 |
| 16 | CalendarPage | `src/pages/CalendarPage.jsx` | P1 |

### Phase 5 — Goals
| # | Task | Files | Priority |
|---|------|-------|----------|
| 17 | useGoals hook | `src/hooks/useGoals.js` | P1 |
| 18 | GoalCard component | `src/components/GoalCard.jsx` | P1 |
| 19 | GoalsPage | `src/pages/GoalsPage.jsx` | P1 |

### Phase 6 — Digest (AI)
| # | Task | Files | Priority |
|---|------|-------|----------|
| 20 | DigestPage (client-side analysis) | `src/pages/DigestPage.jsx` | P2 |

### Phase 7 — Search
| # | Task | Files | Priority |
|---|------|-------|----------|
| 21 | SearchPage | `src/pages/SearchPage.jsx` | P2 |

### Phase 8 — Settings
| # | Task | Files | Priority |
|---|------|-------|----------|
| 22 | SettingsPage | `src/pages/SettingsPage.jsx` | P2 |

### Phase 9 — Production Build
| # | Task | Files | Priority |
|---|------|-------|----------|
| 23 | `npm run build` in client/ | produces `client/dist/` | P2 |
| 24 | Update server.js static path | `server.js` | P2 |
| 25 | Update CLAUDE.md, .gitignore | project root | P3 |

### Phase 10 — Seed Data + Polish
| # | Task | Files | Priority |
|---|------|-------|----------|
| 26 | Run seed-entries skill | generates test data | P1 |
| 27 | Run ui-reviewer agent | all pages | P3 |
| 28 | Run code-auditor agent | all JSX/JS | P3 |
| 29 | Test responsive layout | mobile | P3 |

---

## Feature-to-Page Mapping (from listToDo.md, adapted)

| # | Feature | React Page | API Routes | Priority |
|---|---------|------------|------------|----------|
| 1 | Login / Logout | `LoginPage.jsx` | `POST /api/login`, `POST /api/logout` | P0 |
| 2 | Write daily entry | `DashboardPage.jsx` | `POST /api/entries` | P0 |
| 3 | Dashboard — recent entries | `DashboardPage.jsx` | `GET /api/entries` | P0 |
| 4 | Calendar — pick date, see entry | `CalendarPage.jsx` | `GET /api/entries?date=`, `PUT /api/entries/:id` | P1 |
| 5 | Emotion timeline — mood dots | `CalendarPage.jsx` | `GET /api/moods` | P1 |
| 6 | Goals — set + list | `GoalsPage.jsx` | CRUD `/api/goals` | P1 |
| 7 | Goal timeline view | `GoalsPage.jsx` | `GET /api/goals?status=` | P1 |
| 8 | Weekly Digest — AI summary | `DigestPage.jsx` | `GET /api/entries` (client-side analysis) | P2 |
| 9 | Semantic Search | `SearchPage.jsx` | `GET /api/entries?q=` | P2 |
| 10 | Settings — password change | `SettingsPage.jsx` | `PUT /api/password` | P2 |
| 11 | AI Goal Coach | future (integrated) | client-side analysis | P3 |
| 12 | Data Export | `SettingsPage.jsx` | `GET /api/export` | P3 |

---

## What Stays Unchanged

| File | Reason |
|------|--------|
| `server.js` | Express API is complete. Only change: static path to `client/dist`. |
| `data/` | SQLite DB path unchanged. |
| `.mcp.json` | MCP servers are framework-agnostic. |
| `.claude/` agents and skills | Agent prompts are language-agnostic. Skills may get minor updates. |
| CSS custom properties | Same palette, same theme. Import path changes only. |
| `knowledge/project-flow.md` | Architecture docs are still accurate (data flow, user journey). |
| Database schema | `entries`, `goals`, `settings` — no changes needed. |

---

## What Gets Updated

| File | Change |
|------|--------|
| `server.js` line 45 | `express.static(path.join(__dirname, 'client', 'dist'))` |
| `server.js` line 183 | SPA fallback → `client/dist/index.html` |
| `.gitignore` | Add `client/node_modules/`, `client/dist/` |
| `CLAUDE.md` | Stack: React + Vite. Conventions: JSX, hooks, components in `client/src/`. Dev: `npm run dev --prefix client`. |
| `knowledge/listToDo.md` | Archive or update — vanilla JS steps replaced by this plan. |

---

## Production Deploy

```bash
# Build the React app
cd client && npm run build    # → client/dist/

# Run the server (serves API + built React app)
cd .. && node server.js       # → http://localhost:3000
```

Single command, single port. No nginx, no separate frontend deploy. The
Express SPA fallback handles client-side routing.

---

## File Count Summary

| Category | Original (vanilla JS) | New (React) |
|----------|----------------------|-------------|
| HTML pages | 7 `.html` files | 1 `index.html` (Vite entry) |
| JS files | 7 vanilla JS files | ~20 JSX/JS files |
| CSS | 1 `style.css` | 1 `index.css` (copied) |
| Server | `server.js` | `server.js` (unchanged) |
| **Total frontend files** | **15** | **~22** |

More files, but each is smaller, more focused, and reusable. The component
pattern means building page 5 is much faster than building page 1.

---

## Notes

- AI features (emotion analysis, digest generation, goal coaching, semantic
  search) run **client-side** from entry data. Build the data plumbing first,
  then add AI logic on top.
- The MCP/Skill/Agent tools are dev tools — they help build, not features in
  the product.
- Commit after each phase for clear git history.
- Default password: `admin`. Token stored in `localStorage` as `diary_token`.
