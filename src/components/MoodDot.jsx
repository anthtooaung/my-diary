import { cn } from '@/lib/utils'
import { getMood } from '@/lib/moods'

export function MoodDot({ mood, intensity, size = 'sm' }) {
  const config = getMood(mood)
  if (!config) return null

  // Scale dot size slightly by intensity (1-5 → base size to 1.5x)
  const scale = intensity > 0 ? 1 + (intensity - 1) * 0.125 : 1

  return (
    <div
      className={cn(
        'rounded-full',
        config.dotClass,
        size === 'sm' ? 'w-1.5 h-1.5' : 'w-2.5 h-2.5',
      )}
      title={config.label + (intensity > 0 ? ` (${intensity}/5)` : '')}
      style={{ transform: `scale(${scale})` }}
    />
  )
}
