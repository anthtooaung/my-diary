import express from 'express'
import Database from 'better-sqlite3'
import crypto from 'crypto'
import path from 'path'
import { fileURLToPath } from 'url'
import OpenAI from 'openai'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3000
const DATA_DIR = path.join(__dirname, 'data')

// Ensure data directory exists
import fs from 'fs'
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// ── Database ──────────────────────────────────────────────────────────────
const db = new Database(path.join(DATA_DIR, 'diary.db'))
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    mood TEXT,
    created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
  );

  CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'weekly',
    deadline TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`)

// Set default password if not set
const existing = db.prepare('SELECT value FROM settings WHERE key = ?').get('password')
if (!existing) {
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('password', 'admin')
}

// Migrate existing date formats to ISO 8601 (space → T separator)
db.prepare("UPDATE entries SET created_at = REPLACE(created_at, ' ', 'T') || 'Z' WHERE created_at NOT LIKE '%T%'").run()
db.prepare("UPDATE goals SET created_at = REPLACE(created_at, ' ', 'T') || 'Z' WHERE created_at NOT LIKE '%T%'").run()

// ── Middleware ────────────────────────────────────────────────────────────
const app = express()
app.use(express.json())

// Auth middleware
function auth(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' })
  }
  const token = header.slice(7)
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('session_token')
  if (!row || row.value !== token) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
  next()
}

// ── Auth Routes ───────────────────────────────────────────────────────────
app.post('/api/login', (req, res) => {
  const { password } = req.body
  if (!password) {
    return res.status(400).json({ error: 'Password is required' })
  }

  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('password')
  if (!row || row.value !== password) {
    return res.status(401).json({ error: 'Invalid password' })
  }

  const token = crypto.randomUUID()
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('session_token', token)
  res.json({ token })
})

app.post('/api/logout', auth, (req, res) => {
  db.prepare('DELETE FROM settings WHERE key = ?').run('session_token')
  res.json({ ok: true })
})

// ── Entry Routes ──────────────────────────────────────────────────────────
app.get('/api/entries', auth, (req, res) => {
  const { date, start, end, q, limit } = req.query

  let query = 'SELECT * FROM entries'
  const conditions = []
  const params = []

  if (date) {
    conditions.push('date(created_at) = ?')
    params.push(date)
  }
  if (start) {
    conditions.push('date(created_at) >= ?')
    params.push(start)
  }
  if (end) {
    conditions.push('date(created_at) <= ?')
    params.push(end)
  }
  if (q) {
    conditions.push('content LIKE ?')
    params.push(`%${q}%`)
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ')
  }
  query += ' ORDER BY created_at DESC'

  if (limit) {
    query += ' LIMIT ?'
    params.push(parseInt(limit, 10))
  }

  const entries = db.prepare(query).all(...params)
  res.json(entries)
})

app.get('/api/entries/:id', auth, (req, res) => {
  const entry = db.prepare('SELECT * FROM entries WHERE id = ?').get(req.params.id)
  if (!entry) {
    return res.status(404).json({ error: 'Entry not found' })
  }
  res.json(entry)
})

app.post('/api/entries', auth, (req, res) => {
  const { content, mood } = req.body
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Content is required' })
  }

  const result = db.prepare(
    'INSERT INTO entries (content, mood) VALUES (?, ?)'
  ).run(content.trim(), mood || null)

  const entry = db.prepare('SELECT * FROM entries WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(entry)
})

app.put('/api/entries/:id', auth, (req, res) => {
  const entry = db.prepare('SELECT * FROM entries WHERE id = ?').get(req.params.id)
  if (!entry) {
    return res.status(404).json({ error: 'Entry not found' })
  }

  const { content, mood } = req.body
  if (content !== undefined && (!content || !content.trim())) {
    return res.status(400).json({ error: 'Content cannot be empty' })
  }

  db.prepare(
    'UPDATE entries SET content = ?, mood = ? WHERE id = ?'
  ).run(
    content !== undefined ? content.trim() : entry.content,
    mood !== undefined ? mood : entry.mood,
    req.params.id,
  )

  const updated = db.prepare('SELECT * FROM entries WHERE id = ?').get(req.params.id)
  res.json(updated)
})

app.delete('/api/entries/:id', auth, (req, res) => {
  const entry = db.prepare('SELECT * FROM entries WHERE id = ?').get(req.params.id)
  if (!entry) {
    return res.status(404).json({ error: 'Entry not found' })
  }
  db.prepare('DELETE FROM entries WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

// ── Mood Routes ───────────────────────────────────────────────────────────
app.get('/api/moods', auth, (req, res) => {
  const { start, end } = req.query
  let query = "SELECT date(created_at) as date, mood FROM entries WHERE mood IS NOT NULL AND mood != ''"
  const params = []

  if (start) {
    query += ' AND date(created_at) >= ?'
    params.push(start)
  }
  if (end) {
    query += ' AND date(created_at) <= ?'
    params.push(end)
  }

  query += ' ORDER BY created_at ASC'
  const moods = db.prepare(query).all(...params)
  res.json(moods)
})

// ── Goal Routes ───────────────────────────────────────────────────────────
app.get('/api/goals', auth, (req, res) => {
  const { status, category } = req.query
  let query = 'SELECT * FROM goals'
  const conditions = []
  const params = []

  if (status) {
    conditions.push('status = ?')
    params.push(status)
  }
  if (category) {
    conditions.push('category = ?')
    params.push(category)
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ')
  }
  query += ' ORDER BY created_at DESC'

  const goals = db.prepare(query).all(...params)
  res.json(goals)
})

app.post('/api/goals', auth, (req, res) => {
  const { title, category, deadline } = req.body
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' })
  }

  const result = db.prepare(
    'INSERT INTO goals (title, category, deadline) VALUES (?, ?, ?)'
  ).run(title.trim(), category || 'weekly', deadline || null)

  const goal = db.prepare('SELECT * FROM goals WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(goal)
})

app.put('/api/goals/:id', auth, (req, res) => {
  const goal = db.prepare('SELECT * FROM goals WHERE id = ?').get(req.params.id)
  if (!goal) {
    return res.status(404).json({ error: 'Goal not found' })
  }

  const { title, category, deadline, status } = req.body
  db.prepare(
    'UPDATE goals SET title = ?, category = ?, deadline = ?, status = ? WHERE id = ?'
  ).run(
    title ?? goal.title,
    category ?? goal.category,
    deadline !== undefined ? deadline : goal.deadline,
    status ?? goal.status,
    req.params.id,
  )

  const updated = db.prepare('SELECT * FROM goals WHERE id = ?').get(req.params.id)
  res.json(updated)
})

app.delete('/api/goals/:id', auth, (req, res) => {
  const goal = db.prepare('SELECT * FROM goals WHERE id = ?').get(req.params.id)
  if (!goal) {
    return res.status(404).json({ error: 'Goal not found' })
  }
  db.prepare('DELETE FROM goals WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

// ── Settings Routes ───────────────────────────────────────────────────────
app.put('/api/password', auth, (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' })
  }

  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('password')
  if (!row || row.value !== currentPassword) {
    return res.status(401).json({ error: 'Current password is incorrect' })
  }

  db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(newPassword, 'password')
  res.json({ ok: true })
})

app.get('/api/export', auth, (req, res) => {
  const entries = db.prepare('SELECT * FROM entries ORDER BY created_at ASC').all()
  const goals = db.prepare('SELECT * FROM goals ORDER BY created_at ASC').all()
  const settings = db.prepare("SELECT key, value FROM settings WHERE key != 'session_token'").all()

  res.json({
    exportedAt: new Date().toISOString(),
    entries,
    goals,
    settings,
  })
})

// ── AI Helper ─────────────────────────────────────────────────────────────
async function callOpenAI(systemPrompt, userMessage) {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'openai_api_key'").get()
  if (!row?.value) {
    throw new Error('OpenAI API key not configured. Add your key in Settings.')
  }

  const openai = new OpenAI({ apiKey: row.value })
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.7,
    max_tokens: 1200,
  })
  return completion.choices[0].message.content
}

// ── AI Settings ────────────────────────────────────────────────────────────
app.put('/api/settings/ai-key', auth, (req, res) => {
  const { apiKey } = req.body
  if (!apiKey || !apiKey.trim()) {
    return res.status(400).json({ error: 'API key is required' })
  }
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
    .run('openai_api_key', apiKey.trim())
  res.json({ ok: true })
})

// ── AI Coach ───────────────────────────────────────────────────────────────
app.post('/api/ai/coach', auth, async (req, res) => {
  try {
    const entries = db.prepare(
      "SELECT content, mood, created_at FROM entries WHERE date(created_at) >= date('now', '-7 days') ORDER BY created_at DESC"
    ).all()

    const goals = db.prepare('SELECT * FROM goals ORDER BY created_at DESC').all()

    if (entries.length === 0 && goals.length === 0) {
      return res.status(400).json({ error: 'No entries or goals to coach on. Write some entries and set some goals first.' })
    }

    const systemPrompt = `You are a compassionate, insightful life coach. You review a person's diary entries and goals, then give a brief, personalized coaching report.

Your tone is warm, encouraging, and gently honest. You notice patterns, celebrate wins, and offer one or two specific suggestions.

Keep your response to 3-4 short paragraphs. Use plain text — no markdown formatting. Address the person directly as "you".

Structure:
1. A warm opening that acknowledges their recent entries
2. A note on their goals — what's progressing, what might need attention
3. One specific, actionable suggestion
4. A brief encouraging closing`

    const userMessage = `Here are the recent diary entries and goals:\n\nENTRIES (last 7 days):\n${JSON.stringify(entries, null, 2)}\n\nGOALS:\n${JSON.stringify(goals, null, 2)}`

    const coach = await callOpenAI(systemPrompt, userMessage)
    res.json({ coach })
  } catch (err) {
    const status = err.message.includes('not configured') ? 400 : 500
    res.status(status).json({ error: err.message })
  }
})

// ── AI Year Review ─────────────────────────────────────────────────────────
app.post('/api/ai/year-review', auth, async (req, res) => {
  const { year } = req.body
  if (!year) {
    return res.status(400).json({ error: 'Year is required' })
  }

  try {
    const entries = db.prepare(
      "SELECT content, mood, created_at FROM entries WHERE strftime('%Y', created_at) = ? ORDER BY created_at ASC"
    ).all(String(year))

    if (entries.length === 0) {
      return res.status(400).json({ error: `No entries found for ${year}.` })
    }

    const goals = db.prepare('SELECT * FROM goals ORDER BY created_at DESC').all()

    // Pre-compute some stats to include in the prompt
    const entryCount = entries.length
    const totalWords = entries.reduce((sum, e) => sum + e.content.trim().split(/\s+/).filter(Boolean).length, 0)
    const moods = entries.map(e => e.mood).filter(Boolean)
    const moodCounts = {}
    moods.forEach(m => { moodCounts[m] = (moodCounts[m] || 0) + 1 })
    const topMood = Object.entries(moodCounts).sort(([,a], [,b]) => b - a)[0]

    const systemPrompt = `You are a thoughtful, narrative storyteller. You write beautiful "Year in Review" summaries for a personal diary.

Your tone is reflective, warm, and slightly poetic — like a close friend looking back on a shared year. You weave statistics into a story, not a report.

Use markdown formatting:
- ## headings for sections
- **bold** for emphasis
- > blockquotes for memorable diary excerpts
- Short paragraphs with emotional resonance

Structure:
1. ## By the Numbers — a paragraph weaving together the entry count, total words, and overall consistency
2. ## The Emotional Landscape — describe the dominant mood and any mood patterns
3. ## Moments That Mattered — highlight themes you notice in the entries (use a blockquote for one that stands out)
4. ## Goals & Growth — reflect on what the person was working toward
5. ## A Look Ahead — one paragraph of forward-looking encouragement`

    const stats = {
      year,
      entryCount,
      totalWords,
      topMood: topMood ? `${topMood[0]} (${topMood[1]} of ${moods.length} entries with mood)` : 'no mood data',
    }

    // Send only content + mood + date (trim heavy content to avoid token overflow)
    const lightEntries = entries.map(e => ({
      content: e.content.slice(0, 600),
      mood: e.mood,
      date: e.created_at?.split('T')[0],
    }))

    const userMessage = `STATISTICS:\n${JSON.stringify(stats, null, 2)}\n\nENTRIES:\n${JSON.stringify(lightEntries, null, 2)}\n\nGOALS:\n${JSON.stringify(goals, null, 2)}`

    const review = await callOpenAI(systemPrompt, userMessage)
    res.json({ review })
  } catch (err) {
    const status = err.message.includes('not configured') ? 400 : 500
    res.status(status).json({ error: err.message })
  }
})

// ── Serve React app in production ────────────────────────────────────────
const clientDist = path.join(__dirname, 'dist')
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist))
  // SPA fallback — serve index.html for all non-API, non-static routes
  app.use((_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}

// ── Start ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Diary server running on http://localhost:${PORT}`)
})
