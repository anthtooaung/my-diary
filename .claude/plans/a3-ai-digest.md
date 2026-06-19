# A3 — AI-Powered Digest

## Overview
Upgrade DigestPage with an optional AI-powered analysis. The existing client-side digest stays as fallback. New "AI Digest" button sends the week's entries to GPT-4o-mini for a richer summary.

## Files to Touch (5 files)

| # | File | Action |
|---|------|--------|
| 1 | `server.js` | Add `POST /api/ai/digest` endpoint |
| 2 | `src/api.js` | Add `api.getAIDigest(start, end)` |
| 3 | `src/pages/DigestPage.jsx` | Add AI digest button + result display + toggle |
| 4 | `knowledges/daily-log.md` | Mark A3 done |
| 5 | `knowledges/feature-ideas.md` | Mark A3 done |

## Server: POST /api/ai/digest

- Auth protected
- Takes `{ start, end }` — date strings for the week
- Fetches entries in that range
- Calls `callOpenAI()` with a digest-specific prompt
- Returns `{ digest: "..." }` 
- Returns 400 if no entries, error states same as coach/year-review

### Prompt
```
You are an insightful narrator. Review a week's diary entries and write a digest.

Structure:
1. ## Overall Mood — describe the mood trend across the week
2. ## Key Themes — what topics kept showing up?
3. ## Goals Check — any progress toward goals?
4. ## Highlight — pick one entry that stands out and explain why
5. ## Looking Ahead — one encouraging sentence

Use plain text, keep each section 1-2 sentences.
```

## Frontend: DigestPage Changes

Current: client-side digest auto-computed from entries.
New: add toggle/mode switcher or just an "AI Digest" button.

```
┌──────────────────────────────────────────────┐
│  Weekly Digest    [Client ✦] [AI ✦]         │
└──────────────────────────────────────────────┘
```

Two tabs: "Client" (existing behavior) and "AI" (new). AI tab shows a "Generate AI Digest" button when first switched to, then the AI result.

States for AI mode:
- **No key**: "Set your OpenAI API key in Settings"
- **Empty week**: uses client data to say "No entries this week"
- **Loading**: skeleton/spinner
- **Error**: error card
- **Data**: AI-generated markdown rendered via MarkdownContent

## Edge Cases
- AI result stays cached while toggling between Client/AI tabs
- If AI fails, client digest still works
