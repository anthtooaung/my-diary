import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { EmptyState } from '@/components/EmptyState'
import { NewspaperClipping, CaretLeft, CaretRight } from '@phosphor-icons/react'

function getWeekRange(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day
  const start = new Date(d.setDate(diff))
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function toDateStr(date) {
  return date.toISOString().split('T')[0]
}

export function DigestPage() {
  const [weekOffset, setWeekOffset] = useState(0)
  const baseDate = new Date()
  baseDate.setDate(baseDate.getDate() + weekOffset * 7)
  const { start, end } = getWeekRange(baseDate)

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['entries', 'digest', toDateStr(start), toDateStr(end)],
    queryFn: () => api.getEntries({ start: toDateStr(start), end: toDateStr(end) }),
  })

  const digest = useMemo(() => {
    if (!entries.length) return null

    const moods = entries.map((e) => e.mood).filter(Boolean)
    const moodCounts = {}
    moods.forEach((m) => {
      moodCounts[m] = (moodCounts[m] || 0) + 1
    })

    const allWords = entries.map((e) => e.content.toLowerCase()).join(' ')
    const themes = []
    const themeKeywords = {
      work: ['work', 'job', 'deadline', 'meeting', 'project', 'boss', 'office'],
      family: ['mom', 'dad', 'family', 'parent', 'brother', 'sister', 'cousin'],
      health: ['exercise', 'run', 'gym', 'workout', 'sick', 'tired', 'sleep', 'headache'],
      social: ['friend', 'party', 'dinner', 'lunch', 'coffee', 'hangout', 'date'],
      learning: ['read', 'book', 'study', 'learn', 'course', 'class', 'practice'],
    }

    Object.entries(themeKeywords).forEach(([theme, keywords]) => {
      const matches = keywords.filter((kw) => allWords.includes(kw))
      if (matches.length >= 2) {
        themes.push({ theme, count: matches.length })
      }
    })

    // Find most common mood
    let dominantMood = null
    let maxCount = 0
    Object.entries(moodCounts).forEach(([m, c]) => {
      if (c > maxCount) { dominantMood = m; maxCount = c }
    })

    // Mood trend (first half vs second half)
    const half = Math.ceil(entries.length / 2)
    const firstHalf = entries.slice(0, half).map((e) => e.mood).filter(Boolean)
    const secondHalf = entries.slice(half).map((e) => e.mood).filter(Boolean)

    const positive = ['happy', 'neutral']
    const firstPos = firstHalf.filter((m) => positive.includes(m)).length
    const secondPos = secondHalf.filter((m) => positive.includes(m)).length

    let trend = 'steady'
    if (secondPos > firstPos + 1) trend = 'up'
    if (secondPos < firstPos - 1) trend = 'down'

    // Find longest entry as highlight
    const longest = entries.reduce((a, b) => (b.content.length > a.content.length ? b : a), entries[0])

    return {
      entryCount: entries.length,
      dominantMood,
      maxCount,
      trend,
      themes: themes.sort((a, b) => b.count - a.count),
      highlight: longest,
      allMoods: moods,
    }
  }, [entries])

  return (
    <div className="space-y-6">
      {/* Header */}
      <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
        <NewspaperClipping weight="duotone" className="w-5 h-5 text-primary" />
        Weekly Digest
      </h2>

      {/* Week nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setWeekOffset((o) => o - 1)}
          className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
        >
          <CaretLeft weight="bold" className="w-5 h-5" />
        </button>
        <span className="text-sm font-semibold text-foreground">
          {formatDate(start)} – {formatDate(end)}
        </span>
        <button
          onClick={() => setWeekOffset((o) => o + 1)}
          disabled={weekOffset === 0}
          className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors disabled:opacity-30"
        >
          <CaretRight weight="bold" className="w-5 h-5" />
        </button>
      </div>

      {/* Digest content */}
      {isLoading ? (
        <div className="rounded-xl border border-border bg-card p-6 animate-pulse">
          <div className="h-4 bg-muted rounded w-1/3 mb-3" />
          <div className="h-3 bg-muted rounded w-full mb-2" />
          <div className="h-3 bg-muted rounded w-5/6 mb-2" />
          <div className="h-3 bg-muted rounded w-2/3" />
        </div>
      ) : !digest ? (
        <EmptyState
          icon={NewspaperClipping}
          title="No entries this week"
          description="Write diary entries throughout the week to see your digest here."
        />
      ) : (
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          {/* Mood */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Mood
            </h3>
            <p className="text-sm text-foreground">
              {digest.dominantMood ? (
                <>
                  Mostly <span className="font-semibold">{digest.dominantMood}</span> this week
                  ({digest.maxCount} of {digest.allMoods.length} entries)
                  {digest.trend === 'up' && (
                    <span className="text-emerald-500"> — trending up 📈</span>
                  )}
                  {digest.trend === 'down' && (
                    <span className="text-red-500"> — trending down 📉</span>
                  )}
                  {digest.trend === 'steady' && ' — staying steady'}
                </>
              ) : (
                'No mood data recorded this week. Try adding moods to your entries.'
              )}
            </p>
          </div>

          {/* Themes */}
          {digest.themes.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Themes
              </h3>
              <div className="flex flex-wrap gap-2">
                {digest.themes.map(({ theme, count }) => (
                  <span
                    key={theme}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-3 py-1 text-xs text-foreground"
                  >
                    {theme}
                    <span className="text-muted-foreground">({count})</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Entry count */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Entries
            </h3>
            <p className="text-sm text-foreground">
              You wrote <span className="font-semibold">{digest.entryCount}</span> entries this week.
              {digest.entryCount >= 7 && ' A full week — great consistency! 🎉'}
              {digest.entryCount >= 5 && digest.entryCount < 7 && ' Almost every day. Keep it up! 💪'}
              {digest.entryCount < 5 && ' Try writing more often for richer insights.'}
            </p>
          </div>

          {/* Highlight */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Highlight
            </h3>
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed bg-muted/50 rounded-lg p-3 italic">
              "{digest.highlight.content.slice(0, 200)}{digest.highlight.content.length > 200 ? '…' : ''}"
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(digest.highlight.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
