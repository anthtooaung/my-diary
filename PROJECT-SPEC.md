# My Diary — Complete Project Spec

> Portable spec. Drop this file into any new project folder and hand it to an
> AI. It documents the app idea, the current backend+CSS, and what needs to be
> built on the frontend.

---

## 1. What Is This App?

A **single-user personal diary** with AI-powered insights. One person uses it.
No registration, no multi-user, no social features.

### Features (user-facing)

| # | Feature | How It Works |
|---|---------|--------------|
| 1 | **Login** | Password gate (default: `admin`). Token stored in localStorage. |
| 2 | **Write daily entry** | Text box + optional mood picker (happy/neutral/sad/anxious). |
| 3 | **Dashboard** | Write entry at top, see recent entries below. |
| 4 | **Calendar** | Month grid. Days with entries get colored mood dots. Click a day to read/edit. |
| 5 | **Emotion timeline** | Color dots on calendar give instant visual of your emotional month. |
| 6 | **Goals** | Set weekly/monthly/yearly goals with deadlines. Mark done, edit, delete. |
| 7 | **Goal timeline** | Visual timeline showing all goals in order. |
| 8 | **Weekly Digest** | Pick a week → AI analyzes entries → summary of mood trends, themes, goal progress, highlights. |
| 9 | **Semantic Search** | Search entries by meaning, not just keywords. |
| 10 | **Settings** | Change password, export all data as JSON, logout. |
| 11 | **AI Goal Coach** | (Future) AI checks diary entries against active goals and nudges you. |

---

## 2. User Journey

```
LOGIN → DASHBOARD (write + see recent)
           │
           ├── CALENDAR (month grid, click day → see/edit entry)
           ├── GOALS (set goals, mark done, timeline view)
           ├── DIGEST (pick week → AI summary of mood/themes/goals)
           ├── SEARCH (find entries by meaning)
           └── SETTINGS (password, export, logout)
```

All pages share a **sidebar** (nav + logout button) and **auth layer** (token
in localStorage, sent with every API call).

---

## 3. Database Schema

Three tables, SQLite, created automatically on server start:

```sql
CREATE TABLE entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  mood TEXT,                    -- 'happy' | 'neutral' | 'sad' | 'anxious' | null
  emotion_data TEXT,            -- JSON blob for future AI emotion analysis
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'weekly',   -- 'weekly' | 'monthly' | 'yearly'
  deadline TEXT,
  status TEXT DEFAULT 'active',     -- 'active' | 'completed'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT                       -- stores 'password' and 'token'
);
```

---

## 4. API Routes (fully built, ready to use)

**Base URL:** `http://localhost:3000/api/`

### Auth (no token required)
| Method | Route | Body | Returns |
|--------|-------|------|---------|
| POST | `/api/login` | `{ password }` | `{ token }` or 401 |
| POST | `/api/logout` | — | `{ ok: true }` |

### Entries (token required: `Authorization: Bearer <token>`)
| Method | Route | Query/Body | Returns |
|--------|-------|------------|---------|
| GET | `/api/entries` | `?date=YYYY-MM-DD`, `?q=keyword`, `?limit=N` | `[{ id, content, mood, emotion_data, created_at }]` |
| POST | `/api/entries` | `{ content, mood? }` | created entry |
| PUT | `/api/entries/:id` | `{ content, mood }` | updated entry |
| DELETE | `/api/entries/:id` | — | `{ ok: true }` |
| PUT | `/api/entries/:id/mood` | `{ mood, emotion_data? }` | `{ ok: true }` |

### Moods
| Method | Route | Returns |
|--------|-------|---------|
| GET | `/api/moods` | entries with non-null mood (last 365 days) |

### Goals (token required)
| Method | Route | Query/Body | Returns |
|--------|-------|------------|---------|
| GET | `/api/goals` | `?status=active` | `[{ id, title, category, deadline, status, created_at }]` |
| POST | `/api/goals` | `{ title, category?, deadline? }` | created goal |
| PUT | `/api/goals/:id` | `{ title, category, deadline, status }` | updated goal |
| DELETE | `/api/goals/:id` | — | `{ ok: true }` |

### Settings + Export (token required)
| Method | Route | Body | Returns |
|--------|-------|------|---------|
| PUT | `/api/password` | `{ current, next }` | `{ ok: true }` or 403 |
| GET | `/api/export` | — | `{ entries: [...], goals: [...] }` |

---

## 5. Color Palette & Design System

```css
--bg:       #1a1a2e   /* dark navy background */
--card:     #16213e   /* card/sidebar background */
--card-alt: #0f3460   /* hover/secondary */
--accent:   #e94560   /* buttons, active, highlights (red-pink) */
--text:     #eaeaea   /* body text */
--muted:    #8899aa   /* secondary text, labels */
--border:   #2a3a5e   /* borders, separators */
--green:    #4ecca3   /* success, happy mood */
--yellow:   #f0a500   /* neutral mood, warnings */
--red:      #e94560   /* sad/anxious mood, danger */
```

- Font: `system-ui, -apple-system, 'Segoe UI', sans-serif`
- Layout: sidebar (240px) + scrollable content area, full viewport height
- Cards: dark background, border, rounded corners, subtle shadow
- Responsive: collapses at 768px

---

## 6. Current Project State

### What EXISTS and WORKS

| Layer | File | Status |
|-------|------|--------|
| Server | `server.js` (190 lines) | **Done.** Express + better-sqlite3. All 14 routes implemented with auth, validation, parameterized queries. |
| CSS | `public/css/style.css` (462 lines) | **Done.** Full dark theme. All components styled: sidebar, cards, forms, buttons (4 variants × 3 sizes), entries, mood badges, calendar grid + dots, goals, timeline, digest, search results, empty states, utilities, responsive. |
| Login page | `public/index.html` (53 lines) | **Done.** Works end-to-end: password → token → localStorage → redirect. Auto-redirect if token already valid. |
| Dashboard HTML | `public/dashboard.html` (47 lines) | **Skeleton only.** HTML structure exists but references 3 JS files that don't exist (`auth.js`, `entries.js`, `sidebar.js`). |
| Config | `package.json`, `.gitignore`, `.mcp.json` | **Done.** |
| Dev tools | 2 skills, 2 agents, 2 MCP servers | **Done.** Configured and ready. |
| Docs | `knowledge/listToDo.md`, `knowledge/project-flow.md` | **Done.** Thorough build roadmap and architecture docs. |

### What is MISSING

| Category | Files | Count |
|----------|-------|-------|
| JS files | `auth.js`, `sidebar.js`, `entries.js`, `calendar.js`, `goals.js`, `digest.js`, `search.js` | 7 |
| HTML pages | `calendar.html`, `goals.html`, `digest.html`, `search.html`, `settings.html` | 5 |
| Test data | `data/diary.db` (seed-entries skill exists but hasn't been run) | 1 |

### Honest Assessment

The project is **25-30% complete**. The backend and CSS are production-ready.
The frontend is barely started — only the login page works. Every other page
and all JavaScript is TODO. The hard thinking is done (architecture, data
model, API design, visual system). What remains is execution.

---

## 7. What Needs to Be Built (Frontend)

### Shared utilities (build first)
- **auth.js** — `getToken()`, `setToken()`, `clearToken()`, `isLoggedIn()`,
  `fetchWithAuth(url, options)` (wraps fetch, adds Authorization header,
  handles 401 by clearing token and redirecting to login)
- **sidebar.js** — `renderSidebar(activePage)` — creates sidebar DOM with
  nav links (Dashboard, Calendar, Goals, Digest, Search, Settings) and a
  logout button. Highlights the active page.

### Pages (build in priority order)

**P0 — Core (app is useless without these)**
- **Dashboard** (`entries.js`) — wire the textarea + mood select + save
  button. Load and display recent entries. Edit/delete on existing entries.
  This completes `dashboard.html`.

**P1 — Key features**
- **Calendar** (`calendar.html` + `calendar.js`) — render month grid with
  prev/next navigation. Fetch moods and show colored dots on days with
  entries. Click a day → show entry detail below. Click an entry → edit.
- **Goals** (`goals.html` + `goals.js`) — form to create goals
  (title, category, deadline). Display active goals as cards. Mark done,
  edit, delete. Timeline view toggle.

**P2 — AI & polish**
- **Digest** (`digest.html` + `digest.js`) — week selector. Fetch that
  week's entries. Run client-side analysis (mood trends, word frequency,
  goal mentions). Render a nice summary card.
- **Search** (`search.html` + `search.js`) — search input → call
  `GET /api/entries?q=` → display results with highlighted matches.
- **Settings** (`settings.html` + inline JS) — password change form
  (current + new). Export button. Logout.

**P3 — Future**
- AI Goal Coach (integrated into dashboard/goals, client-side analysis)

---

## 8. AI Features (build data plumbing first, then AI logic)

All AI features run **client-side** — they fetch entry data from the API and
analyze it in the browser. The database has an `emotion_data` JSON column
ready for storing AI analysis results.

| Feature | Data Source | Analysis |
|---------|-------------|----------|
| Emotion timeline | `GET /api/moods` | Simple — just render mood dots by date |
| Weekly Digest | `GET /api/entries` (filter by date range) | Analyze mood trends, word frequency, goal mentions, pick highlight quote |
| Semantic Search | `GET /api/entries?q=` | Current: basic LIKE search. Future: AI meaning-based matching |
| AI Goal Coach | entries + active goals | Cross-reference entries with goals, detect progress/lapses, generate nudges |

---

## 9. Dev Tools (already configured)

| Tool | Type | What It Does |
|------|------|--------------|
| `claude-mem` | MCP | Cross-session memory for architecture decisions |
| `context7` | MCP | Pulls accurate library docs while coding |
| `/scaffold-page` | Skill | Generates new page boilerplate (HTML+CSS+JS) with consistent structure |
| `/seed-entries` | Skill | Inserts 2-4 weeks of realistic test entries, moods, and goals |
| `ui-reviewer` | Agent | Reviews pages for visual consistency before commit |
| `code-auditor` | Agent | Scans for bugs, missing error handling, edge cases |

---

## 10. Architecture Decision: Frontend Framework Choice

Two paths forward. Pick one.

### Option A — Vanilla JS (original plan)
- Each page is its own `.html` file in `public/`
- Shared JS: `auth.js`, `sidebar.js`
- Page-specific JS: `entries.js`, `calendar.js`, `goals.js`, etc.
- No build step, no dependencies, no node_modules for frontend
- `node server.js` serves everything
- **Pro:** Simple, zero-config, matches existing code
- **Con:** More boilerplate per page, no component reuse

### Option B — React + Vite (migration plan)
- Vite React app in `client/` directory
- React Router for SPA navigation (no page reloads)
- Components: Sidebar, EntryCard, MoodBadge, GoalCard, etc.
- AuthContext for centralized token management
- Custom hooks: `useEntries()`, `useGoals()`, `useMoods()`
- Vite dev server proxies `/api/*` to Express on port 3000
- Production build → `client/dist/` → served by Express
- **Pro:** Component reuse, real SPA, hot reload, better DX
- **Con:** Build step, more files, React dependency (~20 files vs ~15)

### Recommendation
For a personal app, **Option A (vanilla JS)** is perfectly fine and simpler.
**Option B (React)** is better if you want to practice React or plan to grow
the app. Both use the same backend and CSS. The migration plan for Option B
is documented in `knowledge/react-migration-plan.md`.

---

## 11. Quick-Start Commands

```bash
# Install server dependencies
npm install

# Start server (auto-reload on changes)
npm run dev

# The app is at http://localhost:3000
# Default password: admin

# Seed test data (if the skill is wired up)
# /seed-entries

# For React option:
# cd client && npm install && npm run dev
# Frontend at http://localhost:5173, API proxied to :3000
```

---

## 12. Conventions

- Small commits, clear messages in imperative mood
- Each page gets its own HTML file (vanilla) or page component (React)
- Shared CSS: `style.css` (vanilla) or `src/styles/index.css` (React)
- API routes under `/api/`, auth via token in `Authorization` header
- Never commit `data/diary.db`, `node_modules/`, `.env`, or secrets
- Don't change the SQLite schema without updating the seed-entries skill

---

*Generated from the diary-app at `/home/pc/Documents/AI vibe coding/diary-app`.*
*Last updated: 2026-06-17*
