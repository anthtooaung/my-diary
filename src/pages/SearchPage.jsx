import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { EmptyState } from '@/components/EmptyState'
import { MoodBadge } from '@/components/MoodBadge'
import { parseDate } from '@/lib/utils'
import { MagnifyingGlass, WarningOctagon } from '@phosphor-icons/react'

function stripMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')        // bold
    .replace(/\*(.+?)\*/g, '$1')             // italic
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')      // links
    .replace(/^[-*]\s/gm, '')                // list markers
    .replace(/^>\s/gm, '')                   // blockquote
    .replace(/^#{1,6}\s/gm, '')              // headings
    .replace(/`(.+?)`/g, '$1')               // inline code
    .replace(/~~(.+?)~~/g, '$1')             // strikethrough
}

export function SearchPage() {
  const [query, setQuery] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('')

  const { data: results = [], isLoading, isError } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () => api.searchEntries(searchQuery),
    enabled: searchQuery.length > 0,
  })

  // Fetch all entries to extract tags
  const { data: allEntries = [] } = useQuery({
    queryKey: ['entries'],
    queryFn: () => api.getEntries(),
  })

  // Extract unique tags from all entries
  const allTags = useMemo(() => {
    const tagSet = new Set()
    allEntries.forEach((entry) => {
      (entry.tags || []).forEach((tag) => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [allEntries])

  // Filter results by selected tag
  const filteredResults = useMemo(() => {
    if (!selectedTag) return highlighted
    return highlighted.filter((entry) => (entry.tags || []).includes(selectedTag))
  }, [highlighted, selectedTag])

  // Client-side snippet extraction with match highlighting
  const highlighted = useMemo(() => {
    if (!searchQuery || !results.length) return results
    const terms = searchQuery.toLowerCase().split(/\s+/).filter(Boolean)
    const CONTEXT = 60

    return results.map((entry) => {
      const original = stripMarkdown(entry.content)
      const lower = original.toLowerCase()

      // Find all match positions in the original content
      const matches = []
      terms.forEach((term) => {
        let pos = 0
        while (true) {
          const idx = lower.indexOf(term, pos)
          if (idx === -1) break
          matches.push({ start: idx, end: idx + term.length })
          pos = idx + 1
        }
      })

      if (matches.length === 0) return { ...entry, content: original.slice(0, CONTEXT * 2) + (original.length > CONTEXT * 2 ? '…' : '') }

      // Compute a single snippet window covering all matches (with context)
      const windowStart = Math.max(0, matches[0].start - CONTEXT)
      const windowEnd = Math.min(original.length, matches[matches.length - 1].end + CONTEXT)

      let snippet = original.slice(windowStart, windowEnd)
      if (windowStart > 0) snippet = '…' + snippet
      if (windowEnd < original.length) snippet += '…'

      // Build highlighted segments with <mark> tags
      const parts = []
      let cursor = 0
      // Adjust match positions relative to the snippet start
      const offset = windowStart - (windowStart > 0 ? 1 : 0) // account for leading '…'

      matches.forEach((m) => {
        const relStart = m.start - windowStart + (windowStart > 0 ? 1 : 0)
        const relEnd = m.end - windowStart + (windowStart > 0 ? 1 : 0)
        if (relStart < 0 || relEnd > snippet.length) return // match outside window

        if (relStart > cursor) {
          parts.push(snippet.slice(cursor, relStart))
        }
        parts.push(`<mark>${snippet.slice(relStart, relEnd)}</mark>`)
        cursor = relEnd
      })
      if (cursor < snippet.length) {
        parts.push(snippet.slice(cursor))
      }

      return { ...entry, content: parts.join('') }
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
          className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          autoFocus
        />
        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <MagnifyingGlass weight="bold" className="w-4 h-4" />
          Search
        </button>
      </form>

      {/* Tag filters */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Filter by tag:</span>
          <button
            onClick={() => setSelectedTag('')}
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
              !selectedTag
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:border-muted-foreground'
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                selectedTag === tag
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-muted-foreground'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {searchQuery && (
        <div>
          {isError ? (
            <p className="text-sm text-destructive flex items-center gap-1.5 mb-2">
              <WarningOctagon weight="fill" className="w-4 h-4" />
              Search failed. Please try again.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mb-4">
              {isLoading
                ? 'Searching…'
                : `${filteredResults.length} result${filteredResults.length !== 1 ? 's' : ''} for "${searchQuery}"${selectedTag ? ` tagged #${selectedTag}` : ''}`}
            </p>
          )}

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-xl border border-border p-5 animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">
                Something went wrong while searching. Check your connection and retry.
              </p>
            </div>
          ) : filteredResults.length === 0 ? (
            <EmptyState
              icon={MagnifyingGlass}
              title="No results found"
              description={selectedTag ? `No entries tagged #${selectedTag} match your search.` : 'Try different keywords or broader terms.'}
            />
          ) : (
            <div className="space-y-3">
              {filteredResults.map((entry) => (
                <article key={entry.id} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-muted-foreground">
                      {parseDate(entry.created_at).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    {entry.mood && <MoodBadge mood={entry.mood} />}
                  </div>
                  <p
                    className="text-sm text-foreground whitespace-pre-wrap leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: entry.content }}
                  />
                  {entry.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {entry.tags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                            selectedTag === tag
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  )}
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
