# My Diary

AI-powered personal diary with emotion tracking, goal coaching, analytics, and full-text search. Built for a single user.

## Stack

- **Frontend**: React 19 + Vite 8, React Router 7, TanStack Query 5, Tailwind CSS 4, shadcn/ui
- **Backend**: Express 5 + SQLite (better-sqlite3)
- **AI**: OpenAI GPT-4o-mini (coach, digest, year review)
- **Charts**: Recharts
- **Markdown**: react-markdown + remark-gfm
- **Forms**: react-hook-form + Zod validation
- **State**: Zustand (global UI), TanStack Query (server state)
- **Auth**: Bearer token, single-user (default password: `admin`)

## Getting Started

```bash
# Install dependencies
npm install

# Terminal 1 — Start the backend API
npm run dev:server

# Terminal 2 — Start the Vite dev server
npm run dev
```

Open **http://localhost:5173** in your browser. Log in with `admin`.

## Production

```bash
npm run build
npm start
```

Single command, port 3000 — serves the API and the built React SPA.

## Features

### Core
- **Diary Entries** — Write, edit, delete entries with markdown support (bold, italic, lists, links, quotes)
- **Mood Tracking** — 6 moods (happy, neutral, sad, anxious, angry, exhausted) with 1-5 intensity scale
- **Tags** — Add hashtags to entries, filter by tag in search
- **Pin Entries** — Bookmark important entries, pinned shown first
- **Auto-Save Drafts** — Entry drafts saved to localStorage, restored on revisit

### Views
- **Dashboard** — Write entries + view recent, writing streak counter, mood-aware writing prompts
- **Calendar** — Month grid with color-coded mood dots (scaled by intensity), click to view/edit entries
- **Goals** — Create weekly/monthly/yearly goals, card view + timeline view, deadline tracking
- **Stats** — Analytics dashboard with 6 charts: mood distribution, entries/week, word count trends, top words, goal completion, mood heatmap
- **Search** — SQLite FTS5 full-text search with BM25 relevance ranking, snippet highlighting, tag filtering

### AI Features (requires OpenAI API key)
- **AI Goal Coach** — Reviews your entries against goals, gives personalized coaching
- **Weekly Digest** — AI-generated summary of mood trends, themes, and highlights
- **Year in Review** — Narrative story of your year in moods, words, and moments

### Settings
- **Dark Mode** — Toggle with persistence
- **Change Password** — Secure password update
- **Data Export** — Download all entries, goals, and settings as JSON
- **Data Import** — Restore from JSON backup (merge or replace mode)

## Project Structure

```
src/
  api.js                    # Fetch wrapper with auth
  App.jsx                   # Route definitions
  contexts/AuthContext.jsx   # Token state + login/logout
  stores/useDiaryStore.js   # Zustand store (sidebar, dark mode)
  hooks/useAutoSave.js      # localStorage draft auto-save
  lib/
    moods.js                # Mood config (single source of truth)
    schemas.js              # Zod validation schemas
    utils.js                # cn() helper, parseDate()
    prompts.js              # Writing prompt bank (52 prompts)
  components/
    EntryCard.jsx           # Entry display with edit/pin/tags
    GoalCard.jsx            # Goal card with actions
    GoalTimeline.jsx        # Timeline view for goals
    MoodBadge.jsx           # Mood pill with intensity
    MoodDot.jsx             # Calendar mood dot
    TagInput.jsx            # Hashtag input component
    MarkdownContent.jsx     # Markdown renderer
    MarkdownToolbar.jsx     # Editor toolbar
    WritingPromptCard.jsx   # Mood-aware prompt suggestions
    StreakBadge.jsx         # Writing streak counter
    CoachReport.jsx         # AI coaching report card
    EmptyState.jsx          # Reusable empty state
    ProtectedRoute.jsx      # Auth guard
  pages/
    LoginPage.jsx           # Password login
    DashboardPage.jsx       # Write entries + recent list
    CalendarPage.jsx        # Month grid + day detail
    GoalsPage.jsx           # Goals CRUD + timeline view
    DigestPage.jsx          # Weekly summary + AI digest
    SearchPage.jsx          # FTS5 search + tag filter
    StatsPage.jsx           # Analytics charts
    YearReviewPage.jsx      # AI year-in-review
    SettingsPage.jsx        # Password, AI key, export/import
server.js                   # Express API (entries, goals, moods, search, AI)
```

## Database

SQLite at `data/diary.db` (auto-created on first run):

```
entries:  id, content, mood, intensity, tags, pinned, created_at
goals:    id, title, category, deadline, status, created_at
settings: key, value
entries_fts:  FTS5 virtual table (auto-synced via triggers)
```

## Architecture Docs

See `knowledges/` for detailed docs:
- `daily-log.md` — Development log by date
- `feature-ideas.md` — Full feature backlog (all completed)
- `project-flow.md` — User journeys and data flow
- `react-migration-plan.md` — Original migration plan
- `refactor-zod-zustand-mood-centralization.md` — Refactor details
