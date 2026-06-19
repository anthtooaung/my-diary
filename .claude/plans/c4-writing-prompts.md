# C4 — Writing Prompts Implementation Plan

## Overview
Add a curated prompt bank displayed above the entry form on DashboardPage. Prompts are mood-aware, time-aware, and randomly rotated. User can shuffle to get a new prompt. Zero server changes.

## Files to Touch (5 files)

| # | File | Action |
|---|------|--------|
| 1 | `src/lib/prompts.js` | **New** — curated prompt bank (mood-aware, time-aware, general) |
| 2 | `src/components/WritingPromptCard.jsx` | **New** — card showing prompt + shuffle button |
| 3 | `src/pages/DashboardPage.jsx` | Add `<WritingPromptCard />` above the entry form |
| 4 | `knowledges/daily-log.md` | Mark C4 as done |
| 5 | `knowledges/feature-ideas.md` | Mark C4 as done |

## Prompt Bank Structure (`src/lib/prompts.js`)

```
PROMPTS (object):
  happy:     6 prompts — reflection, gratitude
  neutral:   6 prompts — observation, introspection
  sad:       6 prompts — gentle, uplifting
  anxious:   6 prompts — grounding, calming
  angry:     5 prompts — release, perspective
  exhausted: 5 prompts — gentle, self-care
  general:   8 prompts — always applicable
  morning:   5 prompts — forward-looking
  evening:   5 prompts — reflective
```

~52 prompts total, all hand-written.

### Selection logic (in WritingPromptCard):
1. Read user's **last entry mood** (from the `entries` query data)
2. Determine **time of day**: morning (5am-11:59am) / afternoon / evening (5pm-4:59am)
3. Weighted random: 50% mood-aware, 30% time-aware, 20% general
4. Show a "↻ New prompt" shuffle button to re-roll
5. **No persistence** — prompt resets on shuffle, not stored

## WritingPromptCard Component

```
┌──────────────────────────────────────────┐
│  💡 Writing Prompt                       │
│                                          │
│  "What's one thing that surprised you    │
│   today?"                                │
│                                          │
│                          [↻ New prompt]  │
└──────────────────────────────────────────┘
```

- Uses `Lightbulb` icon from Phosphor Icons
- Dim/border-card style, sits above the form
- Shuffle button in bottom-right
- Subtle animation on prompt change (optional: just swap text)
- **No loading/error/empty states** — this is a local-only component, always has prompts

## DashboardPage Change
Minimal — insert `<WritingPromptCard />` between the `<h2>Today&apos;s Entry</h2>` and the `<form>`. Pass the `entries` array so it can read the last mood.

```jsx
<WritingPromptCard lastMood={entries[0]?.mood} />
```

## Edge Cases
- **No entries yet**: Falls back to time-aware + general prompts (no mood to read)
- **Empty mood**: Ignores mood category, uses time + general
- **Rapid shuffle**: Simple state change, no debounce needed
- **Text overflow**: Prompt text uses `line-clamp-2` — prompts are never longer than 2 lines

## Changelog (for daily-log.md)
```
## 2026-06-19 — C4 Writing Prompts

### Done
- [x] Create `src/lib/prompts.js` — 52 curated prompts (mood-aware, time-aware, general)
- [x] Create `WritingPromptCard.jsx` — display card with mood/time-weighted random selection + shuffle
- [x] Integrate into DashboardPage above the entry form
```
