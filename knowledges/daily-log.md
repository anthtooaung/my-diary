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
3. ~~**C2 — AI Goal Coach**~~ ✅ **DONE** — see below
4. ~~**C3 — Year in Review**~~ ✅ **DONE** — see below

### 🎉 All Tier C Features Complete 🎉

### Prerequisites Remaining
- [x] ~~Install charting library~~ → recharts installed
- [x] ~~Research markdown editor library~~ → react-markdown + remark-gfm
- [x] ~~Configure LLM API key~~ → OpenAI key stored in DB, managed via Settings UI

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

## 2026-06-19 — C2 AI Goal Coach & C3 Year in Review

### Done
- [x] Install `openai` npm package for server-side OpenAI API
- [x] Add `PUT /api/settings/ai-key` — store OpenAI API key in DB
- [x] Add `POST /api/ai/coach` — GPT-4o-mini reviews last 7 days of entries + goals, returns coaching report
- [x] Add `POST /api/ai/year-review` — GPT-4o-mini generates markdown year-in-review narrative
- [x] Add shared `callOpenAI()` server helper with API key check
- [x] Add `aiKeySchema` with `sk-` prefix validation
- [x] Add AI Integration section to SettingsPage — input + save button for OpenAI key
- [x] Add "Coach Me" button to GoalsPage with CoachReport component and loading/error states
- [x] Create `YearReviewPage.jsx` — year picker, generate button, markdown review display
- [x] Add `/year-review` route and `CalendarCheck` sidebar nav link

### Architecture State After
- **AI stack**: `openai` (server-side only), `gpt-4o-mini` model, API key in `settings` table
- **Coach**: `CoachReport.jsx` component on GoalsPage — one-click, shows compassionate 3-4 paragraph report
- **Year Review**: new `YearReviewPage.jsx` with year picker, AI generates markdown rendered via `MarkdownContent`
- **Settings**: API key section with masked input, `sk-` validation, "Save API Key" mutation
- **Sidebar**: 9 nav items now (Dashboard, Calendar, Goals, Digest, Search, Stats, Year Review, Settings)
- **server.js**: 3 new endpoints + `callOpenAI()` helper (111 lines of new server code)

### AI Prompt Design
- **Coach**: Compassionate life coach persona, plain text output, 3-4 paragraphs (opening + goal check + suggestion + closing)
- **Year Review**: Narrative storyteller persona, markdown output with 5 sections (By the Numbers, Emotional Landscape, Moments, Goals & Growth, A Look Ahead)
- Content truncated to 600 chars per entry + 7-day window to stay within gpt-4o-mini context

---
- [x] Express backend with better-sqlite3
- [x] Set up project structure, shadcn/ui theme, routing
- [x] Configured MCP servers (context7, claude-mem)
- [x] Defined developer guidelines in CLAUDE.md

---

## 2026-06-19 — Quick Wins: A1 Edit + B1 Dark Mode + B2 Streaks + B5 Pin

### Done
- [x] **A1 Edit Entries**: Add edit mode to EntryCard (inline textarea + mood selector + Save/Cancel)
- [x] **A1**: Wire updateMutation on DashboardPage and CalendarPage
- [x] **A1**: CalendarPage now uses EntryCard for day detail (shared edit/delete UI)
- [x] **B1 Dark Mode**: Add darkMode + toggleDarkMode to Zustand store with persist middleware (localStorage)
- [x] **B1**: Sun/Moon toggle button in Sidebar (bottom section)
- [x] **B1**: .dark class sync on document.documentElement in App.jsx
- [x] **B2 Writing Streaks**: StreakBadge component — counts consecutive days with entries
- [x] **B2**: 🔥 badge on Dashboard header when streak ≥ 2 days
- [x] **B5 Pin Entries**: Add pinned column to entries table with migration
- [x] **B5**: Extend PUT /api/entries/:id to handle pinned field
- [x] **B5**: PushPin toggle button on EntryCard (filled amber when pinned)
- [x] **B5**: Pinned entries shown first on Dashboard (split into pinned + unpinned sections)

### Architecture State After
- **EntryCard**: now supports onUpdate (inline edit) and onTogglePin (star toggle) in addition to onDelete
- **Dark mode**: Zustand `darkMode` state, persisted to localStorage, Sun/Moon toggle in sidebar, .dark class applied to `<html>`
- **Streaks**: `StreakBadge` component — computes from entry dates, shown on Dashboard
- **Pin**: DB column `pinned INTEGER DEFAULT 0`, API handles pin toggle, EntryCard Pin icon, Dashboard pinned-first ordering
- **CalendarPage**: now uses EntryCard component for day detail (shared edit/delete/pin UI)

---

## 2026-06-20 — A4 SQLite FTS5 Search

### Done
- [x] Create FTS5 virtual table `entries_fts` on (content, mood, tags)
- [x] Add INSERT/UPDATE/DELETE triggers to keep FTS in sync with entries
- [x] Backfill existing entries into FTS on startup (one-time)
- [x] New `GET /api/search?q=` endpoint using FTS5 MATCH with BM25 ranking
- [x] Query sanitization (escape FTS5 special chars) + prefix wildcard matching (`"term"*`)
- [x] Add `api.searchEntries()` client method
- [x] Switch SearchPage to use new FTS endpoint

### Architecture State After
- **FTS5**: `entries_fts` virtual table synced via triggers — zero maintenance
- **Search endpoint**: `GET /api/search?q=` — BM25-ranked results, limit 30
- **Query handling**: Sanitized + prefix matching for partial words
- **Fallback**: FTS syntax errors return empty array gracefully

---

## 2026-06-20 — A2 Goals Timeline View

### Done
- [x] Create `GoalTimeline.jsx` component — vertical timeline with color-coded dots per category
- [x] Goals grouped by category (weekly/monthly/yearly) with section headers
- [x] Timeline dots show status: green (completed), red (overdue), category color (active)
- [x] Shows created date + deadline, "Overdue" label for past-due goals
- [x] Hover actions: toggle done, edit, delete
- [x] Add Cards/Timeline view toggle to GoalsPage (SquaresFour/ListBullets icons)
- [x] Filter tabs work in both view modes
- [x] View toggle styled as pill with active state

### Architecture State After
- **GoalTimeline**: Vertical timeline with left border line and positioned dots
- **Category grouping**: Each category gets its own section with color dot header
- **Timeline items**: Compact cards with created date, deadline, overdue indicator
- **View toggle**: Pill-style switcher next to category filter tabs

---

## 2026-06-20 — B4 Tags on Entries

### Done
- [x] Add `tags TEXT DEFAULT '[]'` column to entries table (JSON array stored as text)
- [x] Update `POST /api/entries` and `PUT /api/entries/:id` to handle tags array
- [x] Update `GET /api/entries` and `GET /api/entries/:id` to parse tags JSON
- [x] Update `entrySchema` in schemas.js to include `tags` field
- [x] Create `TagInput.jsx` component — input with hashtag chips, Enter/comma to add, Backspace to remove, click X to delete
- [x] Add TagInput to DashboardPage (after intensity selector)
- [x] Add TagInput to EntryCard edit mode
- [x] Display tag chips on EntryCard view mode
- [x] Add tag filter to SearchPage — shows all unique tags as filter chips, filters results by selected tag
- [x] Tags shown in search results with clickable chips for quick filtering
- [x] Update auto-save draft to include tags

### Architecture State After
- **DB**: `entries.tags TEXT DEFAULT '[]'` — JSON array of lowercase tag strings
- **TagInput**: Reusable component, accepts `tags` array and `onChange` callback
- **Entry tags**: Displayed as `#work #health` chips below entry content
- **Search**: Tag filter bar with "All" + all unique tags; clicking a tag filters results
- **Cleanup**: Tags are lowercased, trimmed, and deduplicated on add

---

## 2026-06-20 — B3 Mood Intensity

### Done
- [x] Add `intensity INTEGER DEFAULT 0` column to entries table (migration in server.js)
- [x] Update `PUT /api/entries/:id` to handle intensity field (1-5, clamped)
- [x] Update `GET /api/moods` to return intensity alongside mood
- [x] Update `entrySchema` in schemas.js to include `intensity` field
- [x] Add intensity selector to DashboardPage — 1-5 buttons shown when mood is selected, labels (Mild/Light/Moderate/Strong/Intense)
- [x] Add intensity selector to EntryCard edit mode
- [x] Update `MoodBadge` to show intensity label (e.g., "Happy ·Moderate")
- [x] Update `MoodDot` to scale size by intensity on calendar (1-5 → 1x-1.5x)
- [x] Update CalendarPage to fetch and pass intensity to MoodDot
- [x] Update auto-save draft to include intensity

### Architecture State After
- **DB**: `entries.intensity INTEGER DEFAULT 0` — 0 means no intensity, 1-5 scale
- **UI**: Intensity selector appears after mood selection, 5 numbered buttons with text label
- **Display**: MoodBadge shows "·Mild" / "·Intense" etc; MoodDot scales by intensity
- **Draft**: Auto-save and restore includes intensity value

---

## 2026-06-20 — A5 Data Import

### Done
- [x] Add `POST /api/import` endpoint — validates JSON structure, supports merge/replace modes
- [x] Add `api.importData(mode, data)` client function
- [x] Add Data Import section to SettingsPage — file picker, preview (entry/goal counts), Merge/Replace buttons
- [x] Transactional inserts for entries and goals (skips entries without content, goals without title)
- [x] Settings import skips `password` and `session_token` keys for safety
- [x] Error handling for invalid JSON, missing structure, server failures

### Architecture State After
- **Import flow**: File picker → FileReader → JSON parse → preview counts → Merge or Replace → transactional insert
- **Server**: `POST /api/import` accepts `{ mode: 'merge'|'replace', data: { entries, goals, settings } }`
- **Safety**: Replace mode deletes all entries/goals first; password/session_token never imported
- **UI**: File input styled with Tailwind, preview card shows counts + export date, Merge/Replace/Cancel buttons

---

## 2026-06-19 — A3 AI-Powered Digest

### Done
- [x] Add `POST /api/ai/digest` endpoint — GPT-4o-mini generates 5-section digest from week's entries
- [x] Add `api.getAIDigest(start, end)` client function
- [x] Add Summary/AI Digest toggle tabs on DigestPage
- [x] AI mode auto-generates on first click, stays cached while toggling tabs
- [x] AI digest rendered via MarkdownContent (AI returns markdown)
- [x] Error state for missing API key, loading skeleton, empty week handling

### Architecture State After
- **DigestPage**: dual-mode — "Summary" (client-side, existing behavior) + "AI Digest" (OpenAI-powered via gpt-4o-mini)
- **AI prompt**: narrative narrator persona, 5-section markdown format (Overall Mood, Key Themes, Goals Check, Highlight excerpt, Looking Ahead)
- **Mode switching**: client digest always available as fallback; AI result cached per week while on page
