import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { EntryCard } from '@/components/EntryCard'
import { MoodBadge } from '@/components/MoodBadge'
import { EmptyState } from '@/components/EmptyState'
import { PencilLine, Smiley, SmileyAngry, SmileyMeh, SmileyNervous, SmileySad, SmileyXEyes, Notebook } from '@phosphor-icons/react'

const moods = [
  { value: 'happy', label: 'Happy', icon: Smiley, color: 'bg-emerald-500' },
  { value: 'neutral', label: 'Neutral', icon: SmileyMeh, color: 'bg-amber-400' },
  { value: 'sad', label: 'Sad', icon: SmileySad, color: 'bg-blue-400' },
  { value: 'anxious', label: 'Anxious', icon: SmileyNervous, color: 'bg-orange-400' },
  { value: 'angry', label: 'Angry', icon: SmileyAngry, color: 'bg-red-500' },
  { value: 'exhausted', label: 'Exhausted', icon: SmileyXEyes, color: 'bg-purple-400' },
]

export function DashboardPage() {
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('')
  const [saved, setSaved] = useState(false)

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['entries'],
    queryFn: () => api.getEntries(),
  })

  const createMutation = useMutation({
    mutationFn: (data) => api.createEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] })
      setContent('')
      setMood('')
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.deleteEntry(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['entries'] }),
    onError: () => {
      // error state displayed below the entries list
    },
  })

  function handleSubmit(e) {
    e.preventDefault()
    if (!content.trim()) return
    createMutation.mutate({ content: content.trim(), mood })
  }

  return (
    <div className="space-y-6">
      {/* Write entry form */}
      <section>
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <PencilLine weight="duotone" className="w-5 h-5 text-primary" />
          Today&apos;s Entry
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            placeholder="What's on your mind today?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none text-sm"
          />

          {/* Mood selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground mr-1">Mood:</span>
            {moods.map(({ value, label, icon: Icon, color }) => (
              <button
                key={value}
                type="button"
                onClick={() => setMood(mood === value ? '' : value)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  mood === value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-muted-foreground'
                }`}
              >
                <Icon weight={mood === value ? 'fill' : 'regular'} className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={createMutation.isPending || !content.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {createMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
              ) : null}
              {createMutation.isPending ? 'Saving…' : 'Save Entry'}
            </button>
            {createMutation.isError && (
              <p className="text-sm text-destructive">{createMutation.error.message}</p>
            )}
            {saved && (
              <p className="text-sm text-emerald-500 font-medium">Entry saved!</p>
            )}
          </div>
        </form>
      </section>

      {/* Recent entries */}
      <section>
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Notebook weight="duotone" className="w-5 h-5 text-primary" />
          Recent Entries
        </h2>
        {deleteMutation.isError && (
          <p className="text-sm text-destructive mb-3 flex items-center gap-1.5">
            Failed to delete entry. Please try again.
          </p>
        )}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <EmptyState
            icon={PencilLine}
            title="No entries yet"
            description="Write your first diary entry above to get started."
          />
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onDelete={() => deleteMutation.mutate(entry.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
