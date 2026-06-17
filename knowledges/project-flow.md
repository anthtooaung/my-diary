# My Diary — Project Flow

## What Is This?

A single-user personal diary app. Only me. No registration, no multi-user.  
I open it, I write, I review my life over time. AI helps me see patterns I'd miss.

---

## User Journey (Step by Step)

### 1. Login
```
I open the app → see a password field → type password → enter the diary
```
- No registration. Password is set once (default: `admin`).
- Token stored in `localStorage`. Expires on logout.
- If I already have a token, skip login → go straight to dashboard.

### 2. Dashboard (Write & See)
```
I see: a text box on top + my recent entries below
I type: "Today was exhausting. Work deadline, missed lunch, got home late."
I pick mood: 😰 Anxious
I click Save Entry → it appears in the list below
```
- Dashboard = write entry + recent entries.
- Mood is optional but encouraged — powers the emotion timeline later.

### 3. Calendar (Look Back)
```
I click Calendar in sidebar
→ see a full month grid
→ each day has a colored dot if I wrote that day:
  🟢 green  = happy/neutral
  🟡 yellow = neutral
  🔴 red    = sad/anxious/rough day
→ I click March 12 → see what I wrote that day
```
- Calendar is the "review your life" tool.
- Mood dots give instant visual of my emotional month.

### 4. Goals (Set & Track)
```
I click Goals → see a form + my active goals
I write: "Run 3 times this week" → category: weekly → deadline: Sunday
It shows as a card:
  ┌──────────────────────┐
  │ WEEKLY               │
  │ Run 3 times this week│
  │ Due: Mar 17         │
  │ [Done] [Edit] [Delete]│
  └──────────────────────┘
I can switch to Timeline view → see all goals along a line
```
- Goals have 3 categories: weekly / monthly / yearly.
- Timeline view shows them in order with status (active / completed).
- Later: AI Goal Coach agent checks diary entries against active goals.

### 5. Weekly Digest (AI Reflection)
```
I click Digest
→ pick a week: "Mar 10 – Mar 16"
→ AI generates a summary:
  ┌─────────────────────────────────────┐
  │ Week of Mar 10–16                   │
  │                                     │
  │ 😊 Mood: trending up                │
  │     Mon-Tue stressed, Wed onward ok │
  │                                     │
  │ 📌 Themes: work, family, health     │
  │     You mentioned work stress 4     │
  │     times this week.                │
  │                                     │
  │ 🎯 Goals:                           │
  │     ✅ Run 3 times — you did 2.     │
  │        Close. Keep going.           │
  │                                     │
  │ 💡 Highlight:                       │
  │     "Had dinner with mom on Friday. │
  │      Felt really good."             │
  └─────────────────────────────────────┘
```
- Pulls all entries from that week.
- Analyzes mood pattern, word frequency, goal mentions.
- Writes a human-readable summary. Like a personal newsletter.

### 6. Semantic Search (Find by Meaning)
```
I type: "happy moments"
→ not just entries with the word "happy"
→ finds entries where mood was happy, or content sounds positive
→ shows matching entries with the context highlighted
```
- Basic search: keyword match (already in API).
- Semantic search: AI reads entries and finds by meaning, not just words.

### 7. Settings
```
Change password. Export all data (JSON). Logout.
```

---

## How Pages Connect

```
                     ┌──────────┐
                     │  LOGIN   │
                     │index.html│
                     └────┬─────┘
                          │ token stored in localStorage
           ┌──────────────┼──────────────┐
           ▼              ▼              ▼
     ┌──────────┐  ┌──────────┐  ┌──────────┐
     │DASHBOARD │  │CALENDAR  │  │  GOALS   │
     │dashboard │  │calendar  │  │ goals    │
     │ .html    │  │ .html    │  │ .html    │
     └──────────┘  └──────────┘  └──────────┘
           │              │              │
           └──────────────┼──────────────┘
                          │
           ┌──────────────┼──────────────┐
           ▼              ▼              ▼
     ┌──────────┐  ┌──────────┐  ┌──────────┐
     │ DIGEST   │  │ SEARCH   │  │ SETTINGS │
     │ digest   │  │ search   │  │ settings │
     │ .html    │  │ .html    │  │ .html    │
     └──────────┘  └──────────┘  └──────────┘
```

All pages share:
- **Sidebar** — navigation (`public/js/sidebar.js`)
- **Auth** — token management (`public/js/auth.js`)
- **CSS** — single stylesheet (`public/css/style.css`)

---

## Data Flow

```
[BROWSER]                     [SERVER]                    [SQLite]
   │                              │                          │
   │  POST /api/login             │                          │
   │  ──────────────────────────► │  check password          │
   │  ◄────────────────────────── │  return token            │
   │                              │                          │
   │  POST /api/entries           │                          │
   │  Auth: Bearer <token>        │                          │
   │  Body: {content, mood}       │                          │
   │  ──────────────────────────► │  INSERT INTO entries     │
   │  ◄────────────────────────── │  return entry            │
   │                              │                          │
   │  GET /api/entries?date=X     │                          │
   │  ──────────────────────────► │  SELECT FROM entries     │
   │  ◄────────────────────────── │  return entries[]        │
   │                              │                          │
   │  POST /api/goals             │                          │
   │  ──────────────────────────► │  INSERT INTO goals       │
   │  ◄────────────────────────── │  return goal             │
```

---

## Technical Architecture

```
┌──────────────────────────────────────────┐
│                BROWSER                    │
│  ┌────────────────────────────────────┐  │
│  │  HTML pages (SPA-like, no router)  │  │
│  │  - Each page is its own .html file │  │
│  │  - Shared JS: auth, sidebar        │  │
│  │  - Page JS: entries, calendar, etc │  │
│  └──────────────┬─────────────────────┘  │
│                 │  fetch() with token     │
└─────────────────┼────────────────────────┘
                  │
┌─────────────────┼────────────────────────┐
│                 ▼              SERVER     │
│  ┌────────────────────────────────────┐  │
│  │  Express.js (server.js)            │  │
│  │  - Static file serving             │  │
│  │  - JSON API (/api/*)               │  │
│  │  - Token auth middleware            │  │
│  │  - SQLite via better-sqlite3       │  │
│  └──────────────┬─────────────────────┘  │
│                 │                        │
│  ┌──────────────▼─────────────────────┐  │
│  │  SQLite (data/diary.db)            │  │
│  │  - entries                         │  │
│  │  - goals                           │  │
│  │  - settings                        │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

- **No frontend framework** — plain HTML/CSS/vanilla JS. Simple, fast, easy to vibe-code.
- **No build step** — `node server.js` and it just works.
- **SQLite** — zero config, no database server needed, single file.

---

## Git Branch Strategy

```
main ───●───●───●───●───●───●───●───●───●
         │   │   │   │   │   │   │   │   │
         step1 step2 step3 step4 step5 step6 ...
         
One commit per step. Clear message: "step1: auth + sidebar JS"
No PR needed (personal project, single developer).
```
