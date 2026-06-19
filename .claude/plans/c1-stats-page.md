# C1 — Stats Page Implementation Plan

## Overview
Add a `/stats` page with 6 analytics sections, all computed client-side from existing API data (no server changes needed). Uses recharts for charts + one custom heatmap grid.

## Files to Touch (6 files)

| # | File | Action |
|---|------|--------|
| 1 | `package.json` | Add `recharts` dependency |
| 2 | `src/App.jsx` | Import StatsPage, add `<Route path="/stats">` |
| 3 | `src/components/Sidebar.jsx` | Add `ChartBar` icon, add `{ to: '/stats', label: 'Stats', icon: ChartBar }` to links |
| 4 | `src/pages/StatsPage.jsx` | **New file** — full page with 6 chart sections |
| 5 | `knowledges/daily-log.md` | Mark C1 as done |
| 6 | `knowledges/feature-ideas.md` | Mark C1 as done |

## Data Fetching Strategy
All client-side aggregation via 3 TanStack Query calls:

```js
const { data: entries = [] } = useQuery({
  queryKey: ['entries'],
  queryFn: () => api.getEntries(),        // all entries, no filters
})

const { data: goals = [] } = useQuery({
  queryKey: ['goals'],
  queryFn: () => api.getGoals(),          // all goals
})

const { data: moods = [] } = useQuery({
  queryKey: ['moods', 'year'],
  queryFn: () => api.getMoods({ start: oneYearAgo, end: today }),  // for heatmap
})
```

### Why client-side? 
Single-user app, low data volume (100s of entries). No server code needed, no API changes. All aggregations are O(n) JavaScript.

## Page Layout

```
┌────────────────────────────────────────────────────┐
│  📊 Stats                                   (h2)   │
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Mood     │ │ Entries  │ │ Word     │           │
│  │ Dist.    │ │ / Week   │ │ Count    │           │
│  │ (pie)    │ │ (bar)    │ │ (line)   │           │
│  └──────────┘ └──────────┘ └──────────┘           │
│                                                     │
│  ┌─────────────────┐ ┌──────────────────┐          │
│  │ Top Words       │ │ Goal Completion  │          │
│  │ (bar chart)     │ │ (stat card)      │          │
│  └─────────────────┘ └──────────────────┘          │
│                                                     │
│  ┌─────────────────────────────────────────┐       │
│  │ Mood Calendar Heatmap (year grid)       │       │
│  └─────────────────────────────────────────┘       │
└────────────────────────────────────────────────────┘
```

Cards are in a responsive 2-column grid on desktop, stacked on mobile.

## Chart Components (6 sections)

### 1. Mood Distribution — PieChart (recharts)
- **Data**: Count entries per mood value
- **Colors**: Use `MOODS[mood].color` from `src/lib/moods.js` (matches existing mood colors)
- **Render**: `<PieChart>` + `<Pie>` + `<Cell>` per mood + `<Tooltip>` + `<Legend>` 
- **Edge case**: If no entries with mood → show EmptyState "No mood data yet"

### 2. Entries Per Week — BarChart (recharts)
- **Data**: Group entries by ISO week, count per week
- **X-axis**: Week labels (e.g. "Jun W2", "Jun W3")
- **Render**: `<BarChart>` + `<Bar fill="var(--primary)">` + `<XAxis>` + `<YAxis>` + `<Tooltip>`
- **Edge case**: Fewer than 2 weeks of data → "Need more data" message

### 3. Word Count Trend — LineChart (recharts)
- **Data**: For each entry, count words (split by whitespace), chart over time
- **X-axis**: Entry date
- **Y-axis**: Word count
- **Render**: `<LineChart>` + `<Line>` + `<XAxis>` + `<YAxis>` + `<Tooltip>`
- **Edge case**: < 3 entries → "Write more entries to see trends"

### 4. Top Words — BarChart (recharts, horizontal)
- **Data**: Tokenize all entry content, count frequency, top 15 words
- **Stop words**: Filter common words (the, and, was, that, this, with, have, from, were, just, like, they, what, when, etc.)
- **Render**: Horizontal `<BarChart>` + `<Bar>` + `<XAxis>` + `<YAxis>` 
- **Edge case**: No content → EmptyState

### 5. Goal Completion — Stat Cards (custom, no chart)
- **Data**: Count total goals, completed goals, active goals
- **Render**: 3 stat cards (Total, Completed, Active) + progress bar or radial
- **Fallback**: `goals.length === 0` → EmptyState "No goals set yet"

### 6. Mood Calendar Heatmap — Custom Grid (no chart library)
- **Data**: moods[] from `api.getMoods()` — { date, mood } for past 12 months
- **Render**: 12 rows (months) × 31 columns (days), each cell colored by mood or empty
- **Colors**: Use `MOODS[mood].color` with opacity for intensity
- **Tooltip**: Title attribute on each cell showing date + mood
- **Edge case**: No mood data → EmptyState

## States
Every section handles 4 states:
1. **Loading**: `animate-pulse` skeleton placeholder matching the chart shape
2. **Error**: `WarningOctagon` icon + destructive-colored message
3. **Empty**: `EmptyState` component with contextual message per section
4. **Data**: The chart or stat card

The page-level loading shows all 6 skeleton cards simultaneously.

## Changelog (for daily-log.md)
```
## 2026-06-19 — C1 Stats Page

### Done
- [x] Install recharts charting library
- [x] Create `StatsPage.jsx` with 6 analytics sections
- [x] Add `/stats` route and sidebar nav link
- [x] Mood distribution pie chart (recharts PieChart)
- [x] Entries-per-week bar chart (recharts BarChart)
- [x] Word count trend line chart (recharts LineChart)
- [x] Top 15 words horizontal bar chart (recharts BarChart)
- [x] Goal completion stat cards with progress
- [x] Custom 12-month mood calendar heatmap grid
- [x] Loading skeleton, error, and empty states for all sections
```
