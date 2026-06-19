# Quick Wins Bundle — A1 + B1 + B2 + B5

## A1 — Edit Entries

### Current state
- Server: `PUT /api/entries/:id` **already exists** (lines 156-177)
- API client: `api.updateEntry(id, data)` **already exists** (line 76-81)
- EntryCard: delete button exists, no edit button

### Changes needed (3 files)
| File | Change |
|------|--------|
| `src/components/EntryCard.jsx` | Add edit button, inline edit mode (textarea + mood selector + Save/Cancel) |
| `src/pages/DashboardPage.jsx` | Add `useMutation` for `api.updateEntry`, pass to EntryCard |
| `src/pages/CalendarPage.jsx` | Same — add update mutation, pass to day detail view |

### EntryCard edit mode
- Click pen icon → card morphs to edit mode:
  - textarea replaces content `<p>` (pre-filled)
  - mood selector buttons below textarea
  - Save button (calls `onUpdate(id, { content, mood })`) + Cancel button
- Mutation invalidates `['entries']` on success

---

## B1 — Dark Mode Toggle

### Current state
- CSS: `.dark` class already defined on `<html>`, `@custom-variant dark (&:is(.dark *))` in `src/index.css`
- Zustand store: only has `sidebarOpen`

### Changes needed (3 files)
| File | Change |
|------|--------|
| `src/stores/useDiaryStore.js` | Add `darkMode: false` + `toggleDarkMode()` with persist middleware |
| `src/components/Sidebar.jsx` | Add Sun/Moon toggle button at bottom |
| `src/App.jsx` | Add `useEffect` on mount to sync `.dark` class from store |

### Zustand persist
```js
import { persist } from 'zustand/middleware'

create(
  persist(
    (set) => ({
      sidebarOpen: false,
      darkMode: false,
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
      // ...existing actions
    }),
    { name: 'diary-ui' }
  )
)
```

### Sidebar button
- Bottom section (above logout): Sun/Moon icon toggle
- `Sun` when dark mode is off → click to enable dark mode
- `Moon` when dark mode is on → click to disable

### App.jsx sync
```jsx
const darkMode = useDiaryStore((s) => s.darkMode)
useEffect(() => {
  document.documentElement.classList.toggle('dark', darkMode)
}, [darkMode])
```

---

## B2 — Writing Streaks

### Data
- Use existing `entries` data from Dashboard query
- Count consecutive days with entries backward from today
- Show as a small badge/card

### Changes needed (2 files)
| File | Change |
|------|--------|
| `src/components/StreakBadge.jsx` | **New** — receives entries, computes streak, renders badge |
| `src/pages/DashboardPage.jsx` | Add `<StreakBadge entries={entries} />` above entry list |

### Streak algorithm
```js
function computeStreak(entries) {
  const dates = new Set(entries.map(e => e.created_at.split('T')[0]))
  let streak = 0
  const d = new Date()
  while (true) {
    const key = d.toISOString().split('T')[0]
    if (dates.has(key)) { streak++; d.setDate(d.getDate() - 1) }
    else if (key === new Date().toISOString().split('T')[0] && !dates.has(key)) {
      d.setDate(d.getDate() - 1) // skip today (may not have written yet)
      continue
    }
    else break
  }
  return streak
}
```

### Display
- If streak >= 2: 🔥 "3-day streak!" badge on Dashboard
- If streak === 0: nothing shown
- Fire icon (Flame from Phosphor)

---

## B5 — Pin / Favourite Entries

### Database
- Add column: `pinned INTEGER DEFAULT 0` on `entries` table
- Migration-safe: use ALTER TABLE IF NOT EXISTS pattern

### Changes needed (5 files)
| File | Change |
|------|--------|
| `server.js` | Add `pinned` column to entries table (if not exists), add `PUT /api/entries/:id/pin` route |
| `src/api.js` | Add `api.togglePinEntry(id)` |
| `src/components/EntryCard.jsx` | Add star/pin toggle button |
| `src/pages/DashboardPage.jsx` | Split entries into pinned + unpinned, show pinned at top |
| `src/pages/CalendarPage.jsx` | Show pin on day detail |

### Pin toggle
- Pushpin or Star icon on EntryCard
- Click → `PUT /api/entries/:id` with `{ pinned: !entry.pinned }` (reuse updateEntry)
- Actually simpler: reuse the existing updateEntry route, just toggle pinned in the client

Wait — the existing `PUT /api/entries/:id` only updates `content` and `mood`. Need to extend it to handle `pinned` too.

### Server change
Add `pinned` to the entries table creation (if not exists) and to the UPDATE query.

### API
Reuse `api.updateEntry(id, { pinned: 1 })` — just need server to accept `pinned` field.

---

## Total files: ~11 files, ~4 new files

## Changelog
```
## 2026-06-19 — Quick Wins: A1 Edit + B1 Dark Mode + B2 Streaks + B5 Pin

### Done
- [x] A1: Add edit mode to EntryCard (inline textarea + mood + Save/Cancel)
- [x] A1: Wire updateMutation on DashboardPage and CalendarPage
- [x] B1: Add darkMode to Zustand store with persist + localStorage
- [x] B1: Sun/Moon toggle in Sidebar, .dark class sync in App.jsx
- [x] B2: StreakBadge component — counts consecutive writing days
- [x] B2: Show streak badge on Dashboard (Flame icon, only when >= 2)
- [x] B5: Add pinned column to entries table
- [x] B5: Extend PUT /api/entries/:id to handle pinned field
- [x] B5: Star toggle button on EntryCard
- [x] B5: Pinned section at top of Dashboard entry list
```
