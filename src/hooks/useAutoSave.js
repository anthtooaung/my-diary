import { useEffect, useRef, useCallback, useState } from 'react'

const DRAFT_KEY = 'diary_draft'

/**
 * Auto-saves form values to localStorage with a debounce.
 * Restores the saved draft on mount.
 *
 * @param {object} values   — the form values to save (e.g. { content, mood })
 * @param {boolean} enabled — only save when true (e.g. form is dirty)
 * @returns {{ draft: object|null, clearDraft: () => void }}
 */
export function useAutoSave(values, enabled) {
  const timer = useRef(null)
  const mounted = useRef(false)

  // Restore draft on mount only
  const [draft] = useState(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  // Debounced save
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }

    if (!enabled) return

    if (timer.current) clearTimeout(timer.current)

    timer.current = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(values))
      } catch { /* quota exceeded — silently ignore */ }
    }, 1000)

    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [values, enabled])

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch { /* ignore */ }
  }, [])

  return { draft, clearDraft }
}
