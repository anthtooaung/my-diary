// ── Writing Prompt Bank ────────────────────────────────────────────────────
// Organized by mood, time of day, and general fallback.
// Each array holds short, open-ended question prompts.
//
// Mood categories align with src/lib/moods.js MOODS keys.

export const PROMPTS = {
  // ── Mood-aware ──────────────────────────────────────────────────────────
  happy: [
    "What made you smile today? Capture that moment.",
    "Who contributed to your happiness today?",
    "What's going well in your life right now that you want to remember?",
    "Describe the best part of today in vivid detail.",
    "If you could bottle today's feeling, what would you label it?",
    "What are you excited about right now?",
  ],

  neutral: [
    "What's one thing you noticed today that you usually overlook?",
    "If today was a colour, what would it be and why?",
    "Describe a conversation you had today. What stuck with you?",
    "What felt ordinary today that might feel special later?",
    "What did you learn today, even if it was small?",
    "If you wrote a one-sentence story about today, what would it say?",
  ],

  sad: [
    "What's one thing that brought you even a moment of comfort today?",
    "It's okay to feel this way. What do you need most right now?",
    "What's a memory that makes you feel warm inside?",
    "If a friend felt like this, what would you say to them?",
    "What small thing are you looking forward to tomorrow?",
    "Describe your feelings without judging them. Just observe.",
  ],

  anxious: [
    "What's one thing you can control right now?",
    "Take three deep breaths. What do you notice around you?",
    "What's the worst that could happen — and would you survive it?",
    "When have you felt this way before and gotten through it?",
    "What would make today feel more manageable?",
    "Describe where the tension lives in your body. What would help release it?",
  ],

  angry: [
    "What's the real source of your frustration?",
    "If you wrote a letter you'd never send, what would it say?",
    "What boundary would you set if you could?",
    "How would you like to feel instead, and what would get you there?",
    "What's one thing you can let go of tonight?",
  ],

  exhausted: [
    "What drained your energy today?",
    "What's the kindest thing you did for yourself today?",
    "It's okay to rest. What does rest look like for you right now?",
    "What's one tiny thing that went right today?",
    "If tomorrow was a blank slate, what's the one thing you'd change?",
  ],

  // ── Time-aware ──────────────────────────────────────────────────────────
  morning: [
    "What are you looking forward to today?",
    "What's one intention you want to set for the hours ahead?",
    "How do you want to feel by the end of today?",
    "What's one thing that would make today feel like a win?",
    "Who might you connect with today, and how?",
  ],

  evening: [
    "What are you grateful for as the day comes to a close?",
    "What moment from today would you want to relive?",
    "What did you do today that the future you will thank you for?",
    "What will you let go of before you sleep tonight?",
    "If today was a chapter in a book, what would the title be?",
  ],

  // ── General (always applicable) ─────────────────────────────────────────
  general: [
    "What surprised you today?",
    "Who made an impact on you today?",
    "If you could redo one moment from today, what would it be?",
    "What's one thing you wish you'd said out loud today?",
    "Describe the weather today and how it affected your mood.",
    "What's a song, book, or show you encountered today — and what did it make you feel?",
    "What are you thinking about right before writing this?",
    "What's one thing you're proud of, no matter how small?",
  ],
}

/**
 * Get all prompt keys (mood keys + 'morning' + 'evening' + 'general').
 * @param {string} key
 * @returns {string[]}
 */
export function getPrompts(key) {
  return PROMPTS[key] || PROMPTS.general
}

/**
 * Pick a random prompt from a given category.
 * @param {string} key — one of the PROMPTS keys
 * @returns {string}
 */
export function randomPrompt(key) {
  const pool = getPrompts(key)
  return pool[Math.floor(Math.random() * pool.length)]
}

/**
 * Pick a category-weighted random prompt.
 *
 * Weights:
 *   - 50% mood-aware (if a mood is provided and exists)
 *   - 30% time-aware (morning/evening)
 *   - 20% general
 *
 * If no mood provided, the mood weight is redistributed equally to time and general.
 *
 * @param {object} opts
 * @param {string|null} [opts.mood]   — a MOODS value (e.g. 'happy', 'anxious') or null
 * @param {number}     [opts.hour]    — current hour (0–23), defaults to new Date().getHours()
 * @returns {string} a prompt string
 */
export function pickPrompt({ mood, hour } = {}) {
  const h = hour ?? new Date().getHours()
  const timeKey = h >= 5 && h < 12 ? 'morning' : h >= 17 ? 'evening' : null
  const hasMoodKey = mood && PROMPTS[mood]

  const rand = Math.random()

  let category
  if (hasMoodKey && timeKey) {
    // Full selection: mood + time + general
    if (rand < 0.5) category = mood
    else if (rand < 0.8) category = timeKey
    else category = 'general'
  } else if (hasMoodKey) {
    // Mood only (middle of the day)
    category = rand < 0.7 ? mood : 'general'
  } else if (timeKey) {
    // Time only (no mood data)
    category = rand < 0.6 ? timeKey : 'general'
  } else {
    category = 'general'
  }

  return randomPrompt(category)
}
