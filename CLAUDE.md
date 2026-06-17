# My Diary — Claude Memory

## Stack
- **Frontend**: React 19 + Vite 8, React Router 7, TanStack Query 5, Zustand 5
- **Styling**: Tailwind CSS 4 + shadcn/ui (radix-lyra style)
- **Icons**: Phosphor Icons, Lucide Icons
- **Forms**: react-hook-form + zod
- **Font**: JetBrains Mono Variable
- **Backend**: Express 5 + better-sqlite3
- **Auth**: Bearer token, single-user (password in SQLite settings table)

## Conventions
- **File extension**: `.jsx` (not TypeScript — shadcn `components.json` has `tsx: false`)
- **Path alias**: `@/` → `src/`
- **Component pattern**: Named exports, one component per file
- **Data fetching**: TanStack Query hooks in custom hooks (`src/hooks/`), or inline `useQuery`/`useMutation` in pages
- **Auth**: `useAuth()` from `src/contexts/AuthContext.jsx`
- **API calls**: Use the `api` object from `src/api.js`
- **Utility**: `cn()` from `src/lib/utils.js` for merging Tailwind classes
- **CSS**: Global only — `src/index.css` with Tailwind directives + shadcn theme variables
- **No CSS modules or CSS-in-JS** — use Tailwind utility classes

## Directory Structure
```
src/
  api.js            # fetch wrapper (auto-attaches Bearer token, handles 401)
  main.jsx          # React root + BrowserRouter + QueryClientProvider
  App.jsx           # Route definitions
  index.css         # Tailwind + shadcn CSS variables + diary theme tokens
  contexts/
    AuthContext.jsx  # token state, login/logout, localStorage sync
  hooks/
    useEntries.js   # (future) entries CRUD hook
    useGoals.js     # (future) goals CRUD hook
    useMoods.js     # (future) moods hook
  components/
    AppLayout.jsx    # sidebar + <Outlet />
    Sidebar.jsx      # nav links + logout
    ProtectedRoute.jsx # auth guard
    EntryCard.jsx    # single entry display
    MoodBadge.jsx    # colored mood pill
    MoodDot.jsx      # tiny calendar dot
    GoalCard.jsx     # single goal with actions
    EmptyState.jsx   # reusable empty state
  pages/
    LoginPage.jsx    # password form
    DashboardPage.jsx # write entry + recent entries
    CalendarPage.jsx  # month grid + mood dots + day detail
    GoalsPage.jsx    # CRUD goals + timeline
    DigestPage.jsx   # week picker + AI summary
    SearchPage.jsx   # keyword search + results
    SettingsPage.jsx  # password change + export + logout
  lib/
    utils.js         # cn() helper
server.js            # Express API + static serving + SPA fallback
```

## Dev Commands
```bash
npm run dev         # Vite dev server (port 5173, proxies /api → :3000)
npm run dev:server  # Express API server (port 3000)
npm run build       # Production build → dist/
npm start           # Production: node server.js (serves API + dist/)
```

## API Routes
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/login` | No | Returns token |
| POST | `/api/logout` | Yes | Invalidates token |
| GET | `/api/entries` | Yes | List (supports `?date=`, `?start=`, `?end=`, `?q=`, `?limit=`) |
| POST | `/api/entries` | Yes | Create entry |
| GET | `/api/entries/:id` | Yes | Get one entry |
| PUT | `/api/entries/:id` | Yes | Update entry |
| DELETE | `/api/entries/:id` | Yes | Delete entry |
| GET | `/api/moods` | Yes | List moods by date (supports `?start=`, `?end=`) |
| GET | `/api/goals` | Yes | List (supports `?status=`, `?category=`) |
| POST | `/api/goals` | Yes | Create goal |
| PUT | `/api/goals/:id` | Yes | Update goal |
| DELETE | `/api/goals/:id` | Yes | Delete goal |
| PUT | `/api/password` | Yes | Change password |
| GET | `/api/export` | Yes | Export all data as JSON |

## Database (SQLite)
- `data/diary.db` — auto-created on first run
- Tables: `entries`, `goals`, `settings`
- Default password: `admin`
- Token stored in `settings` table as `session_token`

## Build Order
See `knowledges/react-migration-plan.md` for the full 10-phase plan.
