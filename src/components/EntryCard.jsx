import { useState } from 'react'
import { Trash, PencilSimple, Check, X, PushPin } from '@phosphor-icons/react'
import { MoodBadge } from '@/components/MoodBadge'
import { MarkdownContent } from '@/components/MarkdownContent'
import { parseDate } from '@/lib/utils'
import { MOOD_LIST } from '@/lib/moods'

export function EntryCard({ entry, onDelete, onUpdate, onTogglePin }) {
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [editMood, setEditMood] = useState('')

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

  function startEdit() {
    setEditContent(entry.content)
    setEditMood(entry.mood || '')
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
    setEditContent('')
    setEditMood('')
  }

  function saveEdit() {
    if (!editContent.trim()) return
    onUpdate(entry.id, {
      content: editContent.trim(),
      mood: editMood || null,
    })
    setEditing(false)
  }

  if (editing) {
    return (
      <article className="rounded-xl border-2 border-primary bg-card p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatted}</span>
          <span>·</span>
          <span>{time}</span>
          <span>·</span>
          <span className="text-primary font-medium">Editing</span>
        </div>
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none text-sm font-mono"
          autoFocus
        />
        <div className="flex flex-wrap items-center gap-1.5">
          {MOOD_LIST.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setEditMood(editMood === value ? '' : value)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                editMood === value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-muted-foreground'
              }`}
            >
              <Icon weight={editMood === value ? 'fill' : 'regular'} className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={saveEdit}
            disabled={!editContent.trim()}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Check weight="bold" className="w-3.5 h-3.5" />
            Save
          </button>
          <button
            onClick={cancelEdit}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X weight="bold" className="w-3.5 h-3.5" />
            Cancel
          </button>
        </div>
      </article>
    )
  }

  return (
    <article className="rounded-xl border border-border bg-card p-5 hover:border-muted-foreground/40 transition-colors group">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatted}</span>
          <span>·</span>
          <span>{time}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {entry.mood && <MoodBadge mood={entry.mood} />}
          {onTogglePin && (
            <button
              onClick={() => onTogglePin(entry.id, !entry.pinned)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
              title={entry.pinned ? 'Unpin' : 'Pin'}
            >
              <PushPin weight={entry.pinned ? 'fill' : 'duotone'} className={`w-4 h-4 ${entry.pinned ? 'text-amber-500' : ''}`} />
            </button>
          )}
          {onUpdate && (
            <button
              onClick={startEdit}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
              title="Edit entry"
            >
              <PencilSimple weight="duotone" className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(entry.id)}
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
