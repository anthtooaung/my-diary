import { cn } from '@/lib/utils'
import { getMood } from '@/lib/moods'

export function MoodBadge({ mood, size = 'sm' }) {
  const config = getMood(mood)
  if (!config) return null

  const { label, icon: Icon, badgeClass } = config

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
        badgeClass,
      )}
    >
      <Icon weight="fill" className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {label}
    </span>
  )
}
