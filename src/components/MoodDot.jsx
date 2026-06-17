import { cn } from '@/lib/utils'

const dotColors = {
  happy: 'bg-emerald-500',
  neutral: 'bg-amber-400',
  sad: 'bg-blue-400',
  anxious: 'bg-orange-400',
  angry: 'bg-red-500',
  exhausted: 'bg-purple-400',
}

export function MoodDot({ mood, size = 'sm' }) {
  if (!mood || !dotColors[mood]) return null

  return (
    <div
      className={cn(
        'rounded-full',
        dotColors[mood],
        size === 'sm' ? 'w-1.5 h-1.5' : 'w-2.5 h-2.5',
      )}
      title={mood}
    />
  )
}
