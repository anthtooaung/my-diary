import {
  Smiley, SmileyMeh, SmileySad, SmileyNervous, SmileyAngry, SmileyXEyes,
} from '@phosphor-icons/react'

export const MOODS = {
  happy: {
    value: 'happy',
    label: 'Happy',
    icon: Smiley,
    dotClass: 'bg-emerald-500',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  neutral: {
    value: 'neutral',
    label: 'Neutral',
    icon: SmileyMeh,
    dotClass: 'bg-amber-400',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  sad: {
    value: 'sad',
    label: 'Sad',
    icon: SmileySad,
    dotClass: 'bg-blue-400',
    badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  anxious: {
    value: 'anxious',
    label: 'Anxious',
    icon: SmileyNervous,
    dotClass: 'bg-orange-400',
    badgeClass: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  },
  angry: {
    value: 'angry',
    label: 'Angry',
    icon: SmileyAngry,
    dotClass: 'bg-red-500',
    badgeClass: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  },
  exhausted: {
    value: 'exhausted',
    label: 'Exhausted',
    icon: SmileyXEyes,
    dotClass: 'bg-purple-400',
    badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  },
}

/** Flat array of all moods, for iterating in mood selectors */
export const MOOD_LIST = Object.values(MOODS)

/** Moods considered "positive" for trend analysis */
export const POSITIVE_MOODS = ['happy', 'neutral']

/**
 * Look up a single mood by value string.
 * Returns undefined if the value is not a recognized mood.
 */
export function getMood(value) {
  return MOODS[value]
}
