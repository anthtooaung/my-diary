# Init Progress Log

Track of completed tasks and architecture changes by date.

---

## 2026-06-18 — Zod Validation, Mood Centralization & Zustand Sidebar

### Done
- [x] Centralize all 6 mood configurations into `src/lib/moods.js` (was duplicated in 3 files)
- [x] Create `src/lib/schemas.js` with Zod schemas: `loginSchema`, `passwordChangeSchema`, `entrySchema`, `goalSchema`
- [x] Migrate LoginPage, DashboardPage, GoalsPage, SettingsPage from manual `useState` forms to `react-hook-form` + `zodResolver`
- [x] Extract `POSITIVE_MOODS` and `GOAL_CATEGORIES` constants into shared modules
- [x] Create `src/stores/useDiaryStore.js` — global Zustand store for sidebar open/close state
- [x] Remove `onNavigate` prop drilling from AppLayout → Sidebar
- [x] Update `CLAUDE.md`: mark zod/hook-form/zustand as integrated, update Moods section, add Form Validation & State Management sections, add refactor doc to knowledge files
- [x] Write `knowledges/refactor-zod-zustand-mood-centralization.md` — full detailed changelog

### Architecture State After
- **Single mood source**: `src/lib/moods.js` — `MOODS`, `MOOD_LIST`, `POSITIVE_MOODS`, `getMood()`
- **Validation layer**: `src/lib/schemas.js` — all Zod schemas + `GOAL_CATEGORIES`
- **Form pattern**: `useForm({ resolver: zodResolver(schema) })` — all pages
- **UI store**: `src/stores/useDiaryStore.js` — `sidebarOpen` + actions, any component can read/write
- **Memory files**: `.claude/.../memory/mood-centralization.md`, `zod-schemas.md`, `zustand-sidebar-store.md`

---

## 2026-06-18 — Search Highlighting & Snippet Contextualization (`3d45823`)

- [x] Added highlighting to search results
- [x] Snippet extraction showing context around matched keywords

---

## 2026-06-18 — UI Spacing, Navigation Callbacks & Goal Creation Feedback (`ea528c8`)

- [x] Refined UI spacing and styling across pages
- [x] Added navigation callbacks
- [x] Goal creation success feedback
- [x] Fixed date calculation for calendar entries

---

## 2026-06-18 — Error Handling UI (`c0ae58b`)

- [x] Implemented error handling UI across all page views
- [x] Descriptive failure states for loading/empty/error conditions

---

## 2026-06-17 — Date Handling Utility (`ca763ef`)

- [x] Introduced `parseDate` utility in `src/lib/utils.js`
- [x] Standardized date handling across all diary components

---

---

## 2026-06-19 — Planned: Tier C Features

See `knowledges/feature-ideas.md` for full details.

### Priority Order
1. **C1 — Stats Page** — mood pie, entries/week bar, word counts, mood heatmap, goal completion rate
2. **C4 — Writing Prompts** — curated prompt bank, mood-aware, random rotation
3. **C5 — Rich Text Editor** — markdown editing, preview, auto-save draft
4. **C2 — AI Goal Coach** — LLM-powered weekly check-in against active goals
5. **C3 — Year in Review** — full-year aggregate with AI narrative

### Prerequisites
- [ ] Install charting library (recharts or chart.js)
- [ ] Research markdown editor library (TipTap, Milkdown, etc.)
- [ ] Configure LLM API key (needed by C2, C3, and A3)

---

## 2026-06-17 — Project Initialization (`69a69ad`, `df7354d`)

- [x] Initialized React + Vite project with Tailwind 4
- [x] Express backend with better-sqlite3
- [x] Set up project structure, shadcn/ui theme, routing
- [x] Configured MCP servers (context7, claude-mem)
- [x] Defined developer guidelines in CLAUDE.md
