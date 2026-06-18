import { cn } from '@/lib/utils'
import { getMood } from '@/lib/moods'

export function MoodDot({ mood, size = 'sm' }) {
  const config = getMood(mood)
  if (!config) return null

  return (
    <div
      className={cn(
        'rounded-full',
        config.dotClass,
        size === 'sm' ? 'w-1.5 h-1.5' : 'w-2.5 h-2.5',
      )}
      title={config.label}
    />
  )
}
