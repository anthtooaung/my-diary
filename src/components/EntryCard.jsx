import { Trash } from '@phosphor-icons/react'
import { MoodBadge } from '@/components/MoodBadge'
import { MarkdownContent } from '@/components/MarkdownContent'
import { parseDate } from '@/lib/utils'

export function EntryCard({ entry, onDelete }) {
  const date = parseDate(entry.created_at)
  const formatted = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const time = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <article className="rounded-xl border border-border bg-card p-5 hover:border-muted-foreground/40 transition-colors group">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatted}</span>
          <span>·</span>
          <span>{time}</span>
        </div>
        <div className="flex items-center gap-2">
          {entry.mood && <MoodBadge mood={entry.mood} />}
          <button
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="Delete entry"
          >
            <Trash weight="duotone" className="w-4 h-4" />
          </button>
        </div>
      </div>
      <MarkdownContent>{entry.content}</MarkdownContent>
    </article>
  )
}
