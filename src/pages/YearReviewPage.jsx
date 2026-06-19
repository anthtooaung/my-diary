import { useState, useMemo } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/api'
import { MarkdownContent } from '@/components/MarkdownContent'
import { EmptyState } from '@/components/EmptyState'
import { CalendarCheck, WarningOctagon, Sparkle } from '@phosphor-icons/react'

export function YearReviewPage() {
  const [year, setYear] = useState(new Date().getFullYear())

  const { data: entries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ['entries'],
    queryFn: () => api.getEntries(),
  })

  // Derive available years from entries
  const years = useMemo(() => {
    const ys = new Set()
    ys.add(new Date().getFullYear())
    entries.forEach((e) => {
      const y = e.created_at?.slice(0, 4)
      if (y) ys.add(Number(y))
    })
    return Array.from(ys).sort((a, b) => b - a)
  }, [entries])

  const reviewMutation = useMutation({
    mutationFn: () => api.getYearReview(year),
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
        <CalendarCheck weight="duotone" className="w-5 h-5 text-primary" />
        Year in Review
      </h2>

      {/* Year picker */}
      {entriesLoading ? (
        <div className="rounded-xl border border-border bg-card p-5 animate-pulse">
          <div className="h-4 bg-muted rounded w-48" />
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <label className="text-sm text-muted-foreground">Review year:</label>
          <select
            value={year}
            onChange={(e) => {
              setYear(Number(e.target.value))
              reviewMutation.reset()
            }}
            className="px-3 py-2 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            onClick={() => reviewMutation.mutate()}
            disabled={reviewMutation.isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {reviewMutation.isPending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
            ) : (
              <Sparkle weight="bold" className="w-4 h-4" />
            )}
            {reviewMutation.isPending ? 'Generating…' : 'Generate Review'}
          </button>
        </div>
      )}

      {/* Result */}
      {reviewMutation.isError && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5">
          <p className="text-sm text-destructive flex items-center gap-1.5">
            <WarningOctagon weight="fill" className="w-4 h-4" />
            {reviewMutation.error.message.includes('not configured')
              ? 'OpenAI API key not configured. Add your key in Settings.'
              : reviewMutation.error.message}
          </p>
        </div>
      )}

      {reviewMutation.isPending && (
        <div className="rounded-xl border border-border bg-card p-5 animate-pulse space-y-3">
          <div className="h-5 bg-muted rounded w-1/3" />
          <div className="h-3 bg-muted rounded w-full" />
          <div className="h-3 bg-muted rounded w-5/6" />
          <div className="h-3 bg-muted rounded w-2/3" />
          <div className="h-16 bg-muted rounded w-full mt-2" />
        </div>
      )}

      {reviewMutation.data ? (
        <div className="rounded-xl border border-border bg-card p-6">
          <MarkdownContent>{reviewMutation.data.review}</MarkdownContent>
        </div>
      ) : !reviewMutation.isPending && !reviewMutation.isError ? (
        <EmptyState
          icon={CalendarCheck}
          title="Generate your year review"
          description="Select a year and click 'Generate Review' to get an AI-powered reflection on your year of diary entries."
        />
      ) : null}
    </div>
  )
}
