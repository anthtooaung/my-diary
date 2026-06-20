import { useState, useRef, useEffect } from 'react'
import { X } from '@phosphor-icons/react'

export function TagInput({ tags = [], onChange, placeholder = 'Add tag…' }) {
  const [input, setInput] = useState('')
  const inputRef = useRef(null)

  function addTag(tag) {
    const cleaned = tag.trim().toLowerCase().replace(/^#/, '')
    if (!cleaned || tags.includes(cleaned)) return
    onChange([...tags, cleaned])
    setInput('')
  }

  function removeTag(tag) {
    onChange(tags.filter((t) => t !== tag))
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  function handleBlur() {
    if (input.trim()) addTag(input)
  }

  return (
    <div
      className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
        >
          #{tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              removeTag(tag)
            }}
            className="hover:text-destructive transition-colors"
          >
            <X weight="bold" className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[80px] bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
    </div>
  )
}
