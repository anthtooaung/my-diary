# Feature Ideas

Brainstorm from June 18, 2026. Tiers ordered by scope — A is small fill-ins, B is quality-of-life, C is bigger features.

---

## Tier A — Fill Gaps from Original Vision

### A1 — Edit Entries ✅ DONE (June 19, 2026)
- **Problem**: Can only create & delete. To fix a typo, you must delete and re-create the whole entry.
- **What**: Add edit button on EntryCard → inline or modal form → `PUT /api/entries/:id`
- **Needs**:
  - API: `PUT /api/entries/:id` route on server
  - `api.updateEntry(id, data)` in `src/api.js`
  - Edit mode on `EntryCard.jsx` (inline textarea + mood selector, or popover)
  - Mutation on `DashboardPage.jsx` (or wherever entry list is shown)

### A2 — Goals Timeline View
- **Problem**: Original plan shows goals on a visual timeline, but only card list exists.
- **What**: Second view mode on GoalsPage — toggle between "Cards" and "Timeline"
- **Needs**:
  - A visual horizontal/vertical timeline component
  - Grouped by category (weekly/monthly/yearly) along time axis
  - Active vs completed visual distinction
  - Same data, different render

### A3 — AI-Powered Digest ✅ DONE (June 19, 2026)
- **Problem**: DigestPage is purely client-side — counts moods, finds frequent words, no real intelligence.
- **What**: Send week's entries to an LLM → get back mood trend, themes, goal correlation, highlight quote
- **Needs**:
  - LLM integration (OpenAI API or Anthropic API)
  - Prompt engineering for structured summary output
  - Streaming or loading state while waiting
  - Fallback to client-side if no API key configured

### A4 — Semantic Search
- **Problem**: Search is keyword-only. Can't search "times I felt proud" if the word "proud" isn't written.
- **What**: Embed entries → vector similarity search → find by meaning
- **Needs**:
  - Embedding model (could be same LLM API or a local embedding model)
  - Store embeddings (SQLite with vector extension, or in-memory)
  - Embed query → cosine similarity against all entries → top-K results
  - Could also be done client-side for small entry counts

### A5 — Data Import ✅ DONE (June 20, 2026)
- **Problem**: Export exists but no way to restore from the JSON backup.
- **What**: Import JSON file → validate structure → merge or replace
- **Needs**:
  - File picker on SettingsPage
  - API: `POST /api/import` route
  - Validation: check JSON structure before writing
  - Safety: confirm dialog, maybe backup current data first

---

## Tier B — Quality of Life

### B1 — Dark Mode Toggle ✅ DONE (June 19, 2026)
- **Problem**: CSS has `.dark` class but no user-facing switch. Dark mode only activates at OS level.
- **What**: Toggle button in sidebar or settings that adds/removes `.dark` on `<html>`, persisted in Zustand + localStorage
- **Needs**:
  - Add `darkMode` + `toggleDarkMode()` to `useDiaryStore` with persist middleware
  - Toggle icon (Sun/Moon from Phosphor) in Sidebar or AppLayout header
  - Apply `.dark` class to `document.documentElement` on mount

### B2 — Writing Streaks ✅ DONE (June 19, 2026)
- **Problem**: No motivation mechanic. Diary habit is hard to build.
- **What**: "You've written 12 days in a row!" badge on Dashboard
- **Needs**:
  - Count consecutive days with entries backward from today
  - Streak counter on Dashboard (maybe a small card/badge)
  - Could extend to "longest streak ever" stat

### B3 — Mood Intensity ✅ DONE (June 20, 2026)
- **Problem**: "Anxious" covers everything from mild nervousness to full panic.
- **What**: 1–5 intensity slider per mood selection
- **Needs**:
  - New DB column `intensity INTEGER` on `entries`
  - UI: once mood is picked, show a 1–5 scale
  - Display on EntryCard, MoodDot (could tint saturation by intensity)
  - Digest could show intensity trends

### B4 — Tags on Entries ✅ DONE (June 20, 2026)
- **Problem**: Can only slice by date. Can't group entries by topic.
- **What**: `#work` `#family` `#health` tags — filterable, searchable
- **Needs**:
  - Tag input on DashboardPage entry form (free-text, comma or hashtag separated)
  - DB: new `tags` table + `entry_tags` junction, or JSON column
  - Tag chips on EntryCard
  - Filter sidebar or tag cloud on SearchPage/DashboardPage

### B5 — Pin / Favourite Entries ✅ DONE (June 19, 2026)
- **Problem**: Some entries are special but get buried in the list.
- **What**: Star/bookmark button on EntryCard → pinned section at top of list, or filter to see only pinned
- **Needs**:
  - DB: `pinned BOOLEAN DEFAULT 0` on `entries`
  - API: `PUT /api/entries/:id/pin`
  - Pin toggle icon (Star from Phosphor) on EntryCard
  - Optional: "Pinned" filter/section on Dashboard

---

## Tier C — Bigger Ideas (Planned for June 19, 2026)

### C1 — Stats Page ✅ DONE (June 19, 2026)
- **What**: Full analytics dashboard for your diary
- **Components**:
  - **Mood distribution pie/donut chart** — what percentage of days are happy vs anxious?
  - **Entries-per-week bar chart** — are you writing more or less over time?
  - **Word count trend** — are your entries getting longer or shorter?
  - **Most-used words cloud** — what topics dominate?
  - **Mood calendar heatmap** — year view with color intensity per day
  - **Goal completion rate** — how many goals set vs completed?
- **Needs**:
  - Charting library (recharts or chart.js — lightweight, React-friendly)
  - New page: `StatsPage.jsx` + route `/stats`
  - Aggregation queries on server or client-side from full entry data
  - Sidebar nav link with icon

### C2 — AI Goal Coach ✅ DONE (June 19, 2026)
- **What**: Weekly automated check-in that reads your entries against your goals
- **Implemented**:
  - "Coach Me" button on GoalsPage with `CoachReport` card display
  - GPT-4o-mini reviews last 7 days of entries + all goals
  - 4-paragraph report: opening, goal check, suggestion, closing
  - Loads key from `settings` table, handled server-side via `openai` npm package
  - Error states for missing API key and API failures

### C3 — Year in Review ✅ DONE (June 19, 2026)
- **What**: "Your 2026 in moods, words, and moments" — AI-generated narrative
- **Implemented**:
  - New `YearReviewPage.jsx` with year picker (auto-detects years from entries)
  - "Generate Review" button sends year's entries to GPT-4o-mini
  - AI returns markdown with 5 sections (By the Numbers, Emotional Landscape, Moments, Goals, A Look Ahead)
  - Rendered via existing `MarkdownContent` component
  - Pre-computes entry count, word count, dominant mood for AI prompt context
  - Content truncated to 600 chars per entry to stay within model context

### C4 — Writing Prompts ✅ DONE (June 19, 2026)
- **What**: On days you feel stuck, get a question prompt
- **Behavior**:
  - "What's one thing that surprised you today?"
  - "Who did you talk to today that made an impact?"
  - "If today was a color, what would it be and why?"
  - Could be mood-aware: if you're anxious → calming prompts; if happy → reflection prompts
  - Could be time-aware: evening → "What are you grateful for?"; morning → "What are you looking forward to?"
- **Needs**:
  - Prompt bank (curated list, expandable)
  - Display on DashboardPage (maybe a card above the form, or placeholder text)
  - Prompt rotation or random selection
  - Optional AI-generated prompts based on recent entries

### C5 — Rich Text / Markdown Editor ✅ DONE (June 19, 2026)
- **What**: Write more expressive entries with formatting
- **Implemented**:
  - Toolbar with Bold/Italic/List/Link/Quote buttons (inserts markdown at cursor)
  - Write/Preview toggle tabs (live preview via react-markdown)
  - Auto-save draft to localStorage (debounced 1s, restored on mount with indicator)
  - `<MarkdownContent>` renders all entries everywhere (EntryCard, Calendar, Digest, Dashboard preview)
  - SearchPage strips markdown before snippet highlighting
  - Textarea uses `font-mono` for better markdown editing feel
  - **Zero server changes** — markdown in existing `content` column, plain text is backward compatible

---

## Priority Plan — June 19, 2026

### Focus: Tier C

1. ~~**C1 — Stats Page**~~ ✅ **DONE** — 6 chart sections, all client-side
2. ~~**C4 — Writing Prompts**~~ ✅ **DONE** — 52 prompts, mood/time-aware selection, shuffle
3. ~~**C5 — Rich Text Editor**~~ ✅ **DONE** — markdown toolbar, preview, auto-save draft
4. ~~**C2 — AI Goal Coach**~~ ✅ **DONE** — Coach Me button, GPT-4o-mini report
5. ~~**C3 — Year in Review**~~ ✅ **DONE** — year picker, AI-generated markdown narrative

### 🎉 All Tier C Features Complete — June 19, 2026 🎉

Prerequisites across Tier C:
- ~~**Charting library**: needed by C1, C3 → install recharts or chart.js early~~ ✅ recharts installed
- ~~**Markdown editor**: needed by C5 → research library, affects core entry form~~ ✅ react-markdown + remark-gfm
- ~~**LLM API key**: needed by C2, C3, and A3 → configure once, reusable across features~~ ✅ OpenAI key stored in DB, Settings UI
