import { cn } from '@/lib/utils'
import { getMood } from '@/lib/moods'

const INTENSITY_LABELS = ['', 'Mild', 'Light', 'Moderate', 'Strong', 'Intense']

export function MoodBadge({ mood, intensity, size = 'sm' }) {
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
      {intensity > 0 && intensity <= 5 && (
        <span className="opacity-70">·{INTENSITY_LABELS[intensity]}</span>
      )}
    </span>
  )
}
