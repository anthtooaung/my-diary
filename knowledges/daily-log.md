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

## 2026-06-19 — C1 Stats Page

### Done
- [x] Install recharts charting library
- [x] Create `StatsPage.jsx` with 6 analytics sections (mood pie, entries/week bar, word count line, top words bar, goal completion cards, mood heatmap grid)
- [x] Add `/stats` route in `App.jsx` and sidebar nav link (`ChartBar` icon)
- [x] All sections handle loading skeleton, error, empty, and data states
- [x] **No server changes** — all aggregation done client-side via `useMemo` on existing `api.getEntries()`, `api.getGoals()`, `api.getMoods()` data

### Architecture State After
- **Chart library**: recharts — PieChart, BarChart, LineChart used with ResponsiveContainer
- **Stats page**: `src/pages/StatsPage.jsx` — 6 ChartSection components, each with composable sub-components
- **Sidebar**: 7 nav items (added Stats between Search and Settings)
- **Data pattern**: Client-side aggregation is viable for single-user scale — all entries/goals/moods fetched once

### Remaining Tier C (in priority order)
1. ~~**C4 — Writing Prompts**~~ ✅ **DONE** — see below
2. ~~**C5 — Rich Text Editor**~~ ✅ **DONE** — see below
3. **C2 — AI Goal Coach** — LLM-powered weekly check-in against active goals
4. **C3 — Year in Review** — full-year aggregate with AI narrative

### Prerequisites Remaining
- [x] ~~Install charting library~~ → recharts installed
- [x] ~~Research markdown editor library~~ → react-markdown + remark-gfm (lightweight, safe rendering)
- [ ] Configure LLM API key (needed by C2, C3, and A3)

---

## 2026-06-19 — C4 Writing Prompts

### Done
- [x] Create `src/lib/prompts.js` — 52 curated prompts organized by mood (happy/neutral/sad/anxious/angry/exhausted), time (morning/evening), and general categories
- [x] Create `WritingPromptCard.jsx` — card with mood/time-weighted random prompt selection + shuffle button
- [x] Integrate into `DashboardPage.jsx` above the entry form, reading last entry's mood

### Architecture State After
- **Prompt bank**: `src/lib/prompts.js` — exports `PROMPTS`, `getPrompts()`, `randomPrompt()`, `pickPrompt()`
- **Writing prompt card**: `src/components/WritingPromptCard.jsx` — receives `lastMood`, uses `pickPrompt()` for weighted selection
- **Dashboard**: now shows prompt card between heading and form; shuffles on click

---

## 2026-06-19 — C5 Rich Text / Markdown Editor

### Done
- [x] Install react-markdown + remark-gfm for safe, GFM-capable markdown rendering
- [x] Create `MarkdownContent.jsx` — reusable renderer with prose-like Tailwind styling (lists, blockquotes, code, tables, etc.)
- [x] Create `MarkdownToolbar.jsx` — Bold/Italic/List/Link/Quote buttons that insert markdown syntax at cursor + Write/Preview toggle tabs
- [x] Create `useAutoSave.js` hook — debounced (1s) localStorage draft save and restore with `clearDraft()`
- [x] Update `EntryCard.jsx`, `CalendarPage.jsx`, `DigestPage.jsx` to render entry content through `<MarkdownContent>`
- [x] Update `SearchPage.jsx` — strip markdown formatting chars before snippet extraction + `<mark>` highlighting
- [x] Update `DashboardPage.jsx` — integrate toolbar, Write/Preview mode toggle, auto-save draft with "Draft restored" indicator, `font-mono` textarea
- [x] **No server changes** — markdown stored in existing `content` column, backward compatible with plain text entries

### Architecture State After
- **Markdown rendering**: `src/components/MarkdownContent.jsx` — wraps react-markdown + remark-gfm with consistent prose styling
- **Markdown editing**: `src/components/MarkdownToolbar.jsx` — 5 formatting buttons + Write/Preview toggle, manipulates textarea via ref
- **Draft system**: `src/hooks/useAutoSave.js` — localStorage-based, debounced, handles restore and clear
- **Entry form**: DashboardPage now has toolbar above textarea, Preview tab renders live markdown preview, draft auto-saves
- **All display locations**: EntryCard, CalendarPage day detail, DigestPage highlight, and Dashboard Preview all render through MarkdownContent
- **SearchPage**: strips markdown before highlighting — snippets remain clean plain text

---

- [x] Initialized React + Vite project with Tailwind 4
- [x] Express backend with better-sqlite3
- [x] Set up project structure, shadcn/ui theme, routing
- [x] Configured MCP servers (context7, claude-mem)
- [x] Defined developer guidelines in CLAUDE.md
