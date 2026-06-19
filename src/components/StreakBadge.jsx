import { useMemo } from 'react'
import { Flame } from '@phosphor-icons/react'

function computeStreak(entries) {
  if (!entries.length) return 0

  const dates = new Set(entries.map((e) => e.created_at.split('T')[0]))
  let streak = 0
  const d = new Date()

  // Start from yesterday if today has no entry yet
  const todayStr = d.toISOString().split('T')[0]
  if (!dates.has(todayStr)) {
    d.setDate(d.getDate() - 1)
  }

  while (true) {
    const key = d.toISOString().split('T')[0]
    if (dates.has(key)) {
      streak++
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

export function StreakBadge({ entries }) {
  const streak = useMemo(() => computeStreak(entries), [entries])

  if (streak < 2) return null

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-sm font-medium text-amber-600 dark:text-amber-400">
      <Flame weight="fill" className="w-4 h-4" />
      {streak}-day streak!
    </div>
  )
}
