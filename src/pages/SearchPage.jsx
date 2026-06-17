import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { EmptyState } from '@/components/EmptyState'
import { MoodBadge } from '@/components/MoodBadge'
import { MagnifyingGlass } from '@phosphor-icons/react'

export function SearchPage() {
  const [query, setQuery] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () => api.getEntries({ q: searchQuery }),
    enabled: searchQuery.length > 0,
  })

  // Client-side highlight matching
  const highlighted = useMemo(() => {
    if (!searchQuery || !results.length) return results
    const terms = searchQuery.toLowerCase().split(/\s+/).filter(Boolean)
    return results.map((entry) => {
      let content = entry.content
      // Find context around matching terms
      terms.forEach((term) => {
        const idx = content.toLowerCase().indexOf(term)
        if (idx !== -1) {
          const start = Math.max(0, idx - 60)
          const end = Math.min(content.length, idx + term.length + 60)
          let snippet = content.slice(start, end)
          if (start > 0) snippet = '…' + snippet
          if (end < content.length) snippet += '…'
          content = snippet
        }
      })
      return { ...entry, content }
    })
  }, [results, searchQuery])

  function handleSubmit(e) {
    e.preventDefault()
    setSearchQuery(query.trim())
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
        <MagnifyingGlass weight="duotone" className="w-5 h-5 text-primary" />
        Search
      </h2>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          placeholder="Search your entries…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          autoFocus
        />
        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <MagnifyingGlass weight="bold" className="w-4 h-4" />
          Search
        </button>
      </form>

      {/* Results */}
      {searchQuery && (
        <div>
          <p className="text-xs text-muted-foreground mb-4">
            {isLoading
              ? 'Searching…'
              : `${highlighted.length} result${highlighted.length !== 1 ? 's' : ''} for "${searchQuery}"`}
          </p>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-xl border border-border p-5 animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : highlighted.length === 0 ? (
            <EmptyState
              icon={MagnifyingGlass}
              title="No results found"
              description="Try different keywords or broader terms."
            />
          ) : (
            <div className="space-y-3">
              {highlighted.map((entry) => (
                <article key={entry.id} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.created_at).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    {entry.mood && <MoodBadge mood={entry.mood} />}
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {entry.content}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {!searchQuery && (
        <EmptyState
          icon={MagnifyingGlass}
          title="Search your diary"
          description="Type a keyword or phrase to find entries across your diary."
        />
      )}
    </div>
  )
}
