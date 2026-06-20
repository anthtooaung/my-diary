import { useState, useRef, useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { EntryCard } from '@/components/EntryCard'
import { EmptyState } from '@/components/EmptyState'
import { WritingPromptCard } from '@/components/WritingPromptCard'
import { StreakBadge } from '@/components/StreakBadge'
import { MarkdownToolbar } from '@/components/MarkdownToolbar'
import { MarkdownContent } from '@/components/MarkdownContent'
import { useAutoSave } from '@/hooks/useAutoSave'
import { TagInput } from '@/components/TagInput'
import { PencilLine, Notebook, FloppyDiskBack } from '@phosphor-icons/react'
import { MOOD_LIST } from '@/lib/moods'
import { entrySchema } from '@/lib/schemas'

export function DashboardPage() {
  const queryClient = useQueryClient()
  const [saved, setSaved] = useState(false)
  const [mode, setMode] = useState('write')
  const textareaRef = useRef(null)

  const { register, handleSubmit, setValue, reset, control, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(entrySchema),
    defaultValues: { content: '', mood: '', intensity: 0, tags: [] },
  })
  const mood = useWatch({ control, name: 'mood' })
  const content = useWatch({ control, name: 'content' })
  const intensity = useWatch({ control, name: 'intensity' })
  const tags = useWatch({ control, name: 'tags' })

  // Auto-save draft
  const { draft, clearDraft } = useAutoSave(
    { content, mood, intensity, tags },
    !!(content || mood || tags?.length),
  )

  const [draftRestored, setDraftRestored] = useState(false)

  // Restore draft on mount
  useEffect(() => {
    if (draft) {
      reset({
        content: draft.content || '',
        mood: draft.mood || '',
        intensity: draft.intensity || 0,
        tags: draft.tags || [],
      })
      setDraftRestored(true)
      setTimeout(() => setDraftRestored(false), 3000)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['entries'],
    queryFn: () => api.getEntries(),
  })

  const createMutation = useMutation({
    mutationFn: (data) => api.createEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] })
      reset()
      clearDraft()
      setMode('write')
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.deleteEntry(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['entries'] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.updateEntry(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['entries'] }),
  })

  function onSubmit(data) {
    if (!data.content.trim()) return
    createMutation.mutate({
      content: data.content.trim(),
      mood: data.mood || null,
      intensity: data.mood && data.intensity ? data.intensity : 0,
      tags: data.tags || [],
    })
  }

  return (
    <div className="space-y-6">
      {/* Write entry form */}
      <section>
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <PencilLine weight="duotone" className="w-5 h-5 text-primary" />
          Today&apos;s Entry
        </h2>
        <WritingPromptCard lastMood={entries[0]?.mood ?? null} />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <MarkdownToolbar textareaRef={textareaRef} mode={mode} onModeChange={setMode} />
          <div>
            {mode === 'write' ? (
              <textarea
                placeholder="What's on your mind today? You can use **bold**, *italic*, - lists, > quotes, and [links](url)."
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none text-sm font-mono"
                ref={(el) => {
                  textareaRef.current = el
                  register('content').ref(el)
                }}
                onChange={register('content').onChange}
                onBlur={register('content').onBlur}
                name={register('content').name}
              />
            ) : (
              <div className="w-full min-h-[140px] px-4 py-3 rounded-xl border border-border bg-card">
                {content ? (
                  <MarkdownContent>{content}</MarkdownContent>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Nothing to preview yet…</p>
                )}
              </div>
            )}
            {errors.content && (
              <p className="text-sm text-destructive mt-1">{errors.content.message}</p>
            )}
            {draftRestored && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                <FloppyDiskBack weight="fill" className="w-3.5 h-3.5" />
                Draft restored
              </p>
            )}
          </div>

          {/* Mood selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground mr-1">Mood:</span>
            {MOOD_LIST.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setValue('mood', mood === value ? '' : value, { shouldValidate: true })
                  if (mood === value) setValue('intensity', 0)
                }}
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

          {/* Intensity slider — shown when mood is selected */}
          {mood && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Intensity:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setValue('intensity', level === intensity ? 0 : level)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all ${
                      intensity >= level
                        ? 'border-primary bg-primary/20 text-primary'
                        : 'border-border text-muted-foreground hover:border-muted-foreground'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              {intensity > 0 && (
                <span className="text-xs text-muted-foreground">
                  {intensity === 1 && 'Mild'}
                  {intensity === 2 && 'Light'}
                  {intensity === 3 && 'Moderate'}
                  {intensity === 4 && 'Strong'}
                  {intensity === 5 && 'Intense'}
                </span>
              )}
            </div>
          )}

          {/* Tags */}
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Tags:</span>
            <TagInput
              tags={tags || []}
              onChange={(newTags) => setValue('tags', newTags)}
              placeholder="Add tags (e.g. work, health, family)…"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={createMutation.isPending || !isValid}
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
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Notebook weight="duotone" className="w-5 h-5 text-primary" />
            Recent Entries
          </h2>
          <StreakBadge entries={entries} />
        </div>
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
            {/* Pinned entries */}
            {entries.filter((e) => e.pinned).map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onDelete={(id) => deleteMutation.mutate(id)}
                onUpdate={(id, data) => updateMutation.mutate({ id, data })}
                onTogglePin={(id, pinned) => updateMutation.mutate({ id, data: { pinned } })}
              />
            ))}
            {/* Unpinned entries */}
            {entries.filter((e) => !e.pinned).map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onDelete={(id) => deleteMutation.mutate(id)}
                onUpdate={(id, data) => updateMutation.mutate({ id, data })}
                onTogglePin={(id, pinned) => updateMutation.mutate({ id, data: { pinned } })}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
