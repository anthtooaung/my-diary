# Seed Entries

Inserts realistic test data into the diary database so all features can be verified end-to-end.

## When to Use
- First time setting up the project
- After deleting the database (`rm data/diary.db`)
- Before running `ui-reviewer` or `code-auditor` agents

## Prerequisites
- `npm run dev:server` must be running on port 3000 (or the skill can start it)

## What to Insert

### Entries (2-4 weeks, 1-2 per day)

Generate realistic, personal diary entries. Each entry needs:
- `content` — 2-5 sentences, first-person, natural voice. Mix of: work stress, family moments, health/exercise, social events, hobbies, random thoughts, good days, rough days.
- `mood` — one of: `happy`, `neutral`, `sad`, `anxious`, `angry`, `exhausted`
- `created_at` — ISO 8601 datetime, spread across the past 2-4 weeks, varied times of day

**Important**: Vary days so some days have entries and some don't — this makes the Calendar mood dots interesting. Target 15-25 entries total.

### Goals (4-6)

Mix of categories and statuses:
- Some `active`, 1-2 `completed`
- Categories: `weekly`, `monthly`, `yearly`
- `deadline` — ISO date in the future (or past for completed goals)
- Titles should sound like personal goals: "Run 3 times this week", "Finish the book draft", "Call mom every Sunday"

## How to Insert

Use the Express API directly via `curl` or a Node script that calls the API:

```
POST /api/login       { "password": "admin" }  → get token
POST /api/entries     { "content": "...", "mood": "happy" }  (with Bearer token)
POST /api/goals       { "title": "...", "category": "weekly", "deadline": "..." }
```

Or write a temporary seed script at `scripts/seed.mjs` that:
1. Imports `better-sqlite3` directly
2. Inserts entries and goals with varied dates
3. Deletes itself after running

## Verification After Seeding
- Run `npm run dev` and `npm run dev:server`
- Open http://localhost:5173
- Verify: Dashboard shows recent entries, Calendar has mood dots on entry days, Digest shows analysis, Search finds entries by keyword, Goals page shows active/completed goals
