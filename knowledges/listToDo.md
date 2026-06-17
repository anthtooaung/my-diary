# My Diary — Build Roadmap

> AI-powered personal diary with emotion timeline, goal coaching, weekly digest,
> semantic search. Built for a single user (myself).

---

## Layer 1 — Product Features (What the end user sees)

These are the app features visible to the user. Each needs a page + API route.

| # | Feature | Page | API Needed | Priority |
|---|---|---|---|---|
| 1 | Login / Logout | `index.html` | `POST /api/login`, `POST /api/logout` | P0 |
| 2 | Write daily entry | `dashboard.html` | `POST /api/entries`, `GET /api/entries` | P0 |
| 3 | Dashboard — recent entries | `dashboard.html` | `GET /api/entries` | P0 |
| 4 | Calendar — pick date, see entry | `calendar.html` | `GET /api/entries?date=`, `PUT /api/entries/:id` | P1 |
| 5 | Emotion timeline — color dots on calendar | `calendar.html` | `GET /api/moods`, `PUT /api/entries/:id/mood` | P1 |
| 6 | Goals — set + list (weekly/monthly/yearly) | `goals.html` | `POST /api/goals`, `GET /api/goals`, `PUT /api/goals/:id`, `DELETE /api/goals/:id` | P1 |
| 7 | Goal timeline — visual progress view | `goals.html` | `GET /api/goals?status=` | P1 |
| 8 | Weekly Digest — AI summary of your week | `digest.html` | (generated client-side from entries) | P2 |
| 9 | Semantic Search — search by meaning | `search.html` | `GET /api/entries?q=` | P2 |
| 10 | Settings — change password | `settings.html` | `PUT /api/password` | P2 |
| 11 | AI Goal Coach — nudges on progress | (integrated into goals/dashboard) | (client-side analysis) | P3 |
| 12 | Data Export | (button in settings) | `GET /api/export` | P3 |

---

## Layer 2 — Dev Tools (MCP / Skill / Agent — used to BUILD)

These are Claude Code tools that help us develop. The user never sees these.

| # | Tool | Type | What It Does | Status |
|---|---|---|---|---|
| 1 | `claude-mem` | MCP | Remembers architecture decisions between sessions | Done |
| 2 | `context7` | MCP | Pulls accurate library docs while coding | Done |
| 3 | `/scaffold-page` | Skill | Generates new page boilerplate (HTML+CSS+JS) | Done |
| 4 | `/seed-entries` | Skill | Inserts test diary data to verify features | Done |
| 5 | `ui-reviewer` | Agent | Reviews pages for visual consistency before commit | Done |
| 6 | `code-auditor` | Agent | Scans for bugs, missing error handling, edge cases | Done |

---

## Master File List — Everything We Need to Create

### Infrastructure (exists)
| File | Status |
|---|---|
| `package.json` | Done |
| `server.js` | Done |
| `.gitignore` | Done |
| `.mcp.json` | Done |
| `CLAUDE.md` | Done |

### Public Pages
| File | Status |
|---|---|
| `public/index.html` (login) | Done |
| `public/dashboard.html` | Done (HTML only) |
| `public/calendar.html` | TODO |
| `public/goals.html` | TODO |
| `public/digest.html` | TODO |
| `public/search.html` | TODO |
| `public/settings.html` | TODO |

### Public Assets
| File | Status |
|---|---|
| `public/css/style.css` | Done |
| `public/js/auth.js` | TODO |
| `public/js/entries.js` | TODO |
| `public/js/sidebar.js` | TODO |
| `public/js/calendar.js` | TODO |
| `public/js/goals.js` | TODO |
| `public/js/digest.js` | TODO |
| `public/js/search.js` | TODO |

### Dev Tools
| File | Status |
|---|---|
| `.claude/skills/scaffold-page/SKILL.md` | Done |
| `.claude/skills/seed-entries/SKILL.md` | Done |
| `.claude/agents/ui-reviewer.md` | Done |
| `.claude/agents/code-auditor.md` | Done |

### Ch3 Deliverables (for team repo)
| File | Status |
|---|---|
| `slides/pitch.md` (6-slide PechaKucha) | TODO |
| Report for team repo (`ch-3/<github>/report.md`) | TODO |

---

## Step-by-Step Build Order

### Step 1: Core JS Utilities
- [ ] `public/js/auth.js` — login/logout helpers, token management, fetch wrapper with auth header
- [ ] `public/js/sidebar.js` — render sidebar nav, highlight active page, logout button

### Step 2: Dashboard — Write & View Entries
- [ ] `public/js/entries.js` — save entry, load recent entries, mood selection, edit/delete

### Step 3: Calendar Page
- [ ] `public/calendar.html` — month grid, click date to see/entry, mood dots
- [ ] `public/js/calendar.js` — render month, navigation, load entries by date

### Step 4: Goals Page
- [ ] `public/goals.html` — goal form, goal cards by category, timeline view
- [ ] `public/js/goals.js` — CRUD for goals, status toggle, deadline handling

### Step 5: Digest Page
- [ ] `public/digest.html` — week selector, AI-generated summary display
- [ ] `public/js/digest.js` — gather week entries, analyze patterns, render summary

### Step 6: Search Page
- [ ] `public/search.html` — search input, results with highlighted matches
- [ ] `public/js/search.js` — search API call, render results

### Step 7: Settings Page
- [ ] `public/settings.html` — password change form
- [ ] Basic JS for form submission

### Step 8: Seed Test Data
- [ ] Run `/seed-entries` skill to create 2-4 weeks of realistic entries
- [ ] Verify all features work end-to-end

### Step 9: Polish + Review
- [ ] Run `ui-reviewer` agent on each page — fix issues
- [ ] Run `code-auditor` agent on all JS files — fix issues
- [ ] Test responsive layout on mobile

### Step 10: Ch3 Deliverables
- [ ] Write 6-slide PechaKucha (`slides/pitch.md`)
- [ ] Write `report.md` for team repo (`team-09/ch-3/<username>/report.md`)
- [ ] Make repo public
- [ ] Verify `.mcp.json`, skills, agents all exist

---

## Database Schema (already in server.js)

```
entries: id, content, mood, emotion_data, created_at
goals:   id, title, category, deadline, status, created_at
settings: key, value
```

Design decisions stored in claude-mem: localStorage schema, component structure, color palette.

---

## Notes
- The AI features (emotion analysis, digest, goal coaching, semantic search) run
  client-side from the entry data. We'll build the data structure first, then add
  the AI logic on top.
- The MCP/Skill/Agent are DEV tools — they help us build, not features in the product.
- Always commit after each step so we have a clear git history.
