# C2 + C3 — AI Goal Coach & Year in Review Implementation Plan

## Overview
Both features share the same OpenAI infrastructure. Build the integration layer once, then plug in both coaching and year-review prompts. 

## Architecture

```
[BROWSER]                     [SERVER]                      [OpenAI]
   │                              │                             │
   │ POST /api/ai/coach           │                             │
   │ ─────────────────────────►   │ read entries+goals          │
   │                              │ build coaching prompt       │
   │                              │ ──────────────────────────► │
   │                              │ ◄────────────────────────── │
   │ ◄───────────────────────     │ return result               │
   │                              │                             │
   │ POST /api/ai/year-review     │                             │
   │ { year: 2026 }               │                             │
   │ ─────────────────────────►   │ read that year's entries    │
   │                              │ build review prompt         │
   │                              │ ──────────────────────────► │
   │                              │ ◄────────────────────────── │
   │ ◄───────────────────────     │ return result               │
```

## Files to Touch (12 files)

| # | File | Action |
|---|------|--------|
| 1 | `package.json` | Add `openai` dependency |
| 2 | `server.js` | Add `PUT /api/settings/ai-key`, `POST /api/ai/coach`, `POST /api/ai/year-review` |
| 3 | `src/api.js` | Add `api.setAIKey()`, `api.getAICoach()`, `api.getYearReview(year)` |
| 4 | `src/lib/schemas.js` | Add `aiKeySchema` for settings form validation |
| 5 | `src/pages/SettingsPage.jsx` | Add OpenAI API key section (input + save button) |
| 6 | `src/pages/GoalsPage.jsx` | Add "Coach Me" button → loading → display coach report |
| 7 | `src/components/CoachReport.jsx` | **New** — card that displays the AI coaching response |
| 8 | `src/pages/YearReviewPage.jsx` | **New** — year picker + generate button + narrative display |
| 9 | `src/components/YearReviewCard.jsx` | **New** — beautiful card displaying the year review |
| 10 | `src/App.jsx` | Add `/year-review` route |
| 11 | `src/components/Sidebar.jsx` | Add nav link for Year Review |
| 12 | `knowledges/daily-log.md` + `feature-ideas.md` | Mark C2 + C3 done |

---

## 1. Server Changes (`server.js`)

### 1a. Save API Key
```js
app.put('/api/settings/ai-key', auth, (req, res) => {
  const { apiKey } = req.body
  if (!apiKey) return res.status(400).json({ error: 'API key is required' })
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
    .run('openai_api_key', apiKey)
  res.json({ ok: true })
})
```

### 1b. Shared OpenAI helper
```js
import OpenAI from 'openai'

async function callOpenAI(systemPrompt, userMessage) {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'openai_api_key'").get()
  if (!row?.value) throw new Error('OpenAI API key not configured. Set it in Settings.')
  
  const openai = new OpenAI({ apiKey: row.value })
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  })
  return completion.choices[0].message.content
}
```

### 1c. Coach endpoint
```js
app.post('/api/ai/coach', auth, async (req, res) => {
  try {
    const entries = db.prepare(
      "SELECT * FROM entries WHERE date(created_at) >= date('now', '-7 days') ORDER BY created_at DESC"
    ).all()
    const goals = db.prepare("SELECT * FROM goals ORDER BY created_at DESC").all()
    
    const result = await callOpenAI(
      'You are a compassionate life coach...',
      JSON.stringify({ entries, goals })
    )
    res.json({ coach: result })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
```

### 1d. Year Review endpoint
```js
app.post('/api/ai/year-review', auth, async (req, res) => {
  const { year } = req.body
  if (!year) return res.status(400).json({ error: 'Year is required' })
  
  try {
    const entries = db.prepare(
      "SELECT * FROM entries WHERE strftime('%Y', created_at) = ? ORDER BY created_at ASC",
    ).all(String(year))
    const goals = db.prepare("SELECT * FROM goals ORDER BY created_at DESC").all()
    
    const result = await callOpenAI('...', JSON.stringify({ year, entries, goals }))
    res.json({ review: result })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
```

---

## 2. SettingsPage — API Key Section

Add a new section between "Change Password" and "Data Export":

```
┌──────────────────────────────────────────┐
│  🤖 AI Integration                       │
│                                          │
│  OpenAI API key (stored encrypted)       │
│  [••••••••••••••••••••••sk-abcd]         │
│                                          │
│  [Save API Key]                          │
│  "API key saved!"                        │
└──────────────────────────────────────────┘
```

- Shows masked key if exists (`••••••••••••sk-abcd` style — first 4 + last 7)
- Form uses react-hook-form + zod validation
- Mutation pattern same as password change

---

## 3. GoalsPage — Coach Me Button

New section above the goal list, or inline button with result card:

```
┌──────────────────────────────────────────┐
│  [🤖 Coach Me]                           │
│                                          │
│  ┌─ Coach Report ────────────────────┐   │
│  │ "You've been consistent with your │   │
│  │  running goal — 3 runs this week. │   │
│  │  However, your work stress seems  │   │
│  │  to be affecting your sleep..."   │   │
│  └────────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

- "Coach Me" button uses `useMutation` → `api.getAICoach()`
- Shows spinner while loading
- Result displayed in `<CoachReport>` card component
- Handles: no API key error, loading, error, empty (no goals/entries)

---

## 4. YearReviewPage — New Page

```
┌──────────────────────────────────────────┐
│  📅 Year in Review                       │
│                                          │
│  Review year: [2026 ▼] [Generate Review] │
│                                          │
│  ┌─ Your 2026 Story ─────────────────┐   │
│  │                                  │   │
│  │  This year you wrote 247 entries │   │
│  │  totalling 31,420 words.         │   │
│  │                                  │   │
│  │  Your dominant mood was happy,   │   │
│  │  appearing on 42% of days...     │   │
│  │                                  │   │
│  │  Top moments...                  │   │
│  │                                  │   │
│  └──────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

- Year dropdown: current year + previous years with entries
- "Generate Review" button triggers `api.getYearReview(year)`
- Result rendered with `<MarkdownContent>` (AI returns markdown)
- Full states: loading, error (no key), error (API failure), empty (no entries that year)

Year picker logic:
- Query available years from `api.getEntries()` on mount (find distinct years)
- Default to current year

---

## 5. Sidebar Nav

Add between Stats and Settings:
```js
{ to: '/year-review', label: 'Year Review', icon: CalendarCheck }
```

---

## 6. Edge Cases & States

### Coach
- **No API key**: Show "Set your OpenAI API key in Settings to use the AI Coach." with link to Settings
- **No goals**: "Set some goals first so the coach has something to work with."
- **No recent entries**: "Write some entries this week before checking in."
- **Loading**: Spinner on button + skeleton card
- **Error**: Destructive error card with retry

### Year Review
- **No API key**: Same pattern as coach
- **Year with 0 entries**: "No entries found for YYYY."
- **Loading**: Skeleton card
- **Error**: Destructive error card with retry
- **AI returns markdown**: Render via MarkdownContent (already built)

---

## Changelog
```
## 2026-06-19 — C2 AI Goal Coach & C3 Year in Review

### Done
- [x] Install openai npm package
- [x] Add AI API key management to SettingsPage
- [x] Add server endpoints: PUT /api/settings/ai-key, POST /api/ai/coach, POST /api/ai/year-review
- [x] Add API functions in src/api.js
- [x] Add "Coach Me" button to GoalsPage with CoachReport component
- [x] Create YearReviewPage with year picker and narrative display
- [x] Add /year-review route and sidebar nav link
```
