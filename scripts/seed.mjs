import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'data', 'diary.db');
const db = new Database(dbPath);

// Helper to generate ISO date string N days ago at a given hour
function daysAgo(n, hour = 12, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString().replace('T', ' ').replace('Z', '').slice(0, 19);
}

function futureDate(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

function pastDate(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

// Clear existing data — disable triggers temporarily
db.exec('DROP TRIGGER IF EXISTS entries_ai');
db.exec('DROP TRIGGER IF EXISTS entries_ad');
db.exec('DROP TRIGGER IF EXISTS entries_au');

db.prepare('DELETE FROM entries').run();
db.prepare('DELETE FROM goals').run();

// Recreate triggers
db.exec(`CREATE TRIGGER entries_ai AFTER INSERT ON entries BEGIN
    INSERT INTO entries_fts(rowid, content, mood, tags)
    VALUES (new.id, new.content, new.mood, new.tags);
  END`);
db.exec(`CREATE TRIGGER entries_ad AFTER DELETE ON entries BEGIN
    INSERT INTO entries_fts(entries_fts, rowid, content, mood, tags)
    VALUES ('delete', old.id, old.content, old.mood, old.tags);
  END`);
db.exec(`CREATE TRIGGER entries_au AFTER UPDATE ON entries BEGIN
    INSERT INTO entries_fts(entries_fts, rowid, content, mood, tags)
    VALUES ('delete', old.id, old.content, old.mood, old.tags);
    INSERT INTO entries_fts(rowid, content, mood, tags)
    VALUES (new.id, new.content, new.mood, new.tags);
  END`);

const insertEntry = db.prepare('INSERT INTO entries (content, mood, created_at) VALUES (?, ?, ?)');
const insertGoal = db.prepare('INSERT INTO goals (title, category, deadline, status, created_at) VALUES (?, ?, ?, ?, ?)');

// --- Entries (20 entries across ~3 weeks) ---
const entries = [
  { content: "Woke up feeling pretty good today. Had a nice breakfast and went for a walk before work. The weather was perfect — cool breeze, sunny skies. Days like this remind me to slow down.", mood: "happy", daysAgo: 21, hour: 8 },
  { content: "Long day at the office. Meetings back to back and barely had time to eat lunch. Came home exhausted but at least I finished the quarterly report.", mood: "exhausted", daysAgo: 20, hour: 20 },
  { content: "Had dinner with old college friends tonight. We haven't all been together in months. Laughed so much my cheeks hurt. These moments are what life is about.", mood: "happy", daysAgo: 19, hour: 23 },
  { content: "Feeling anxious about the project deadline next week. There's still so much to do and I'm not sure we'll make it. Tried to take a few deep breaths but my mind keeps racing.", mood: "anxious", daysAgo: 18, hour: 15 },
  { content: "Went for a run this morning — 5km in under 30 minutes. Getting better every week. My knees are a bit sore but the endorphin rush is worth it.", mood: "happy", daysAgo: 17, hour: 7 },
  { content: "Just a regular Wednesday. Nothing special happened. Work was fine, came home, watched some TV. Sometimes ordinary days are okay.", mood: "neutral", daysAgo: 16, hour: 21 },
  { content: "Had a disagreement with my sister about mom's birthday plans. I know she means well but she never listens to other opinions. Feeling frustrated.", mood: "angry", daysAgo: 15, hour: 19 },
  { content: "Rainy day — stayed in and read a book. Made hot chocolate and curled up on the couch. Sometimes you just need a quiet day to recharge.", mood: "happy", daysAgo: 14, hour: 16 },
  { content: "Couldn't sleep last night. Tossed and turned until 3am. Today was rough — barely focused at work and had two coffees just to function.", mood: "exhausted", daysAgo: 13, hour: 18 },
  { content: "Got feedback on my presentation and it was mostly positive! My manager said I did a great job explaining the technical concepts. Feeling proud of myself.", mood: "happy", daysAgo: 12, hour: 17 },
  { content: "Spent the afternoon helping my nephew with his math homework. He's struggling with fractions but we made progress. Seeing his face light up when he got the right answer was the best part of my day.", mood: "happy", daysAgo: 11, hour: 15 },
  { content: "Woke up feeling sad for no particular reason. Some days are just like that. Tried journaling and going for a walk but the heaviness is still there.", mood: "sad", daysAgo: 10, hour: 10 },
  { content: "Work deadline got pushed back a week! What a relief. Now I can actually breathe and do a proper job instead of rushing through everything.", mood: "happy", daysAgo: 9, hour: 14 },
  { content: "Went to the farmer's market and bought way too many vegetables. Now I need to figure out what to do with all this kale. Made a smoothie that actually tasted decent.", mood: "neutral", daysAgo: 8, hour: 11 },
  { content: "Bad news from the doctor — need to come back for more tests. Trying not to worry but my mind keeps going to worst-case scenarios. Called mom to talk it through.", mood: "anxious", daysAgo: 7, hour: 20 },
  { content: "Cooked dinner for the whole family tonight. Made pasta from scratch — it took three hours but everyone loved it. Worth every minute.", mood: "happy", daysAgo: 6, hour: 21 },
  { content: "Traffic was terrible this morning. An hour and a half commute for what should be 30 minutes. Late to work and missed the team standup. Annoying start to the day.", mood: "angry", daysAgo: 5, hour: 9 },
  { content: "Quiet Sunday. Did laundry, cleaned the apartment, and finished the podcast series I've been listening to. Productive but in a low-key way.", mood: "neutral", daysAgo: 4, hour: 16 },
  { content: "Feeling really down today. Found out I didn't get the promotion I've been working toward for months. It went to someone who's been here less time. Life feels unfair sometimes.", mood: "sad", daysAgo: 2, hour: 22 },
  { content: "Took a mental health day today. Slept in, went to my favorite café, and sat in the park reading. Sometimes you need to step back to move forward. Feeling more like myself again.", mood: "happy", daysAgo: 1, hour: 14 },
];

const insertEntries = db.transaction(() => {
  for (const e of entries) {
    insertEntry.run(e.content, e.mood, daysAgo(e.daysAgo, e.hour));
  }
});
insertEntries();

// --- Goals (6 goals) ---
const goals = [
  { title: "Run 3 times this week", category: "weekly", deadline: futureDate(3), status: "active", createdAgo: 7 },
  { title: "Read 2 books this month", category: "monthly", deadline: futureDate(12), status: "active", createdAgo: 14 },
  { title: "Save $5000 by end of year", category: "yearly", deadline: futureDate(120), status: "active", createdAgo: 30 },
  { title: "Learn to cook 5 new recipes", category: "monthly", deadline: futureDate(8), status: "active", createdAgo: 20 },
  { title: "Complete the online course on React", category: "monthly", deadline: pastDate(5), status: "completed", createdAgo: 25 },
  { title: "Walk 10,000 steps every day this week", category: "weekly", deadline: pastDate(2), status: "completed", createdAgo: 9 },
];

const insertGoals = db.transaction(() => {
  for (const g of goals) {
    insertGoal.run(g.title, g.category, g.deadline, g.status, daysAgo(g.createdAgo));
  }
});
insertGoals();

// Rebuild FTS index
db.exec("INSERT INTO entries_fts(entries_fts) VALUES('rebuild')");

const entryCount = db.prepare('SELECT COUNT(*) as c FROM entries').get();
const goalCount = db.prepare('SELECT COUNT(*) as c FROM goals').get();
console.log(`✅ Seeded ${entryCount.c} entries and ${goalCount.c} goals`);
db.close();
