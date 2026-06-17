import { cn } from '@/lib/utils'
import { Smiley, SmileyAngry, SmileyMeh, SmileyNervous, SmileySad, SmileyXEyes } from '@phosphor-icons/react'

const moodConfig = {
  happy: { label: 'Happy', icon: Smiley, className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  neutral: { label: 'Neutral', icon: SmileyMeh, className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  sad: { label: 'Sad', icon: SmileySad, className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  anxious: { label: 'Anxious', icon: SmileyNervous, className: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' },
  angry: { label: 'Angry', icon: SmileyAngry, className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
  exhausted: { label: 'Exhausted', icon: SmileyXEyes, className: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
}

export function MoodBadge({ mood, size = 'sm' }) {
  const config = moodConfig[mood]
  if (!config) return null

  const { label, icon: Icon, className } = config

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
        className,
      )}
    >
      <Icon weight="fill" className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {label}
    </span>
  )
}
