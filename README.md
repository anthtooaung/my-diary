# My Diary

AI-powered personal diary with emotion timeline, goal coaching, weekly digest, and semantic search. Built for a single user.

## Stack

- **Frontend**: React 19 + Vite 8, React Router 7, TanStack Query, Tailwind CSS 4, shadcn/ui
- **Backend**: Express 5 + SQLite (better-sqlite3)
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

## Project Structure

```
src/
  api.js              # Fetch wrapper with auth
  App.jsx             # Route definitions
  contexts/           # AuthContext
  hooks/              # Custom hooks (useEntries, useGoals, useMoods)
  components/         # Reusable UI components
  pages/              # Login, Dashboard, Calendar, Goals, Digest, Search, Settings
  lib/utils.js        # cn() helper
server.js             # Express API (auth, entries, goals, moods, settings, export)
```

## Features

- Write daily diary entries with mood tracking
- Calendar view with color-coded mood dots
- Goals: weekly/monthly/yearly with status tracking
- Weekly AI digest (mood trends, theme detection, highlights)
- Semantic search across entries
- Data export (JSON)

See `knowledges/` for the full architecture docs and build roadmap.
