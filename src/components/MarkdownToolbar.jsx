import { TextB, TextItalic, ListBullets, LinkSimpleHorizontal, Quotes } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

/**
 * Toolbar that inserts markdown syntax into a textarea and toggles write/preview mode.
 *
 * @param {object} props
 * @param {HTMLTextAreaElement|null} props.textareaRef — ref to the textarea
 * @param {'write'|'preview'} props.mode — current display mode
 * @param {(mode: 'write'|'preview') => void} props.onModeChange — toggle callback
 */
export function MarkdownToolbar({ textareaRef, mode, onModeChange }) {
  function getLinePrefix(before) {
    const atLineStart = before.length === 0 || before.endsWith('\n')
    return atLineStart ? '' : '\n'
  }

  function insert(syntax, placeholder, wrap = false, lineOnly = false) {
    const el = textareaRef?.current
    if (!el) return

    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = el.value.slice(start, end)

    let replacement
    let cursorOffset

    if (wrap && selected) {
      replacement = syntax.replace('$1', selected)
      cursorOffset = replacement.length
    } else if (wrap) {
      replacement = syntax.replace('$1', placeholder)
      cursorOffset = replacement.indexOf(placeholder) + placeholder.length
    } else {
      replacement = syntax
      cursorOffset = replacement.length
    }

    const before = el.value.slice(0, start)
    const after = el.value.slice(end)
    const prefix = lineOnly ? getLinePrefix(before) : ''

    el.value = before + prefix + replacement + after
    el.selectionStart = el.selectionEnd = start + prefix.length + cursorOffset
    el.focus()

    el.dispatchEvent(new Event('input', { bubbles: true }))
  }

  const buttons = [
    { label: 'Bold', icon: TextB, action: () => insert('**$1**', 'bold text', true) },
    { label: 'Italic', icon: TextItalic, action: () => insert('*$1*', 'italic text', true) },
    { label: 'List', icon: ListBullets, action: () => insert('- ', '', false, true) },
    { label: 'Link', icon: LinkSimpleHorizontal, action: () => insert('[$1](url)', 'link text', true) },
    { label: 'Quote', icon: Quotes, action: () => insert('> ', '', false, true) },
  ]

  return (
    <div className="flex items-center justify-between gap-1">
      <div className="flex items-center gap-0.5">
        {buttons.map(({ label, icon: Icon, action }) => (
          <button
            key={label}
            type="button"
            onClick={action}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title={label}
          >
            <Icon weight="bold" className="w-4 h-4" />
          </button>
        ))}
      </div>

      {/* Write / Preview toggle */}
      <div className="flex rounded-lg border border-border overflow-hidden">
        <button
          type="button"
          onClick={() => onModeChange('write')}
          className={cn(
            'px-3 py-1 text-xs font-medium transition-colors',
            mode === 'write'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => onModeChange('preview')}
          className={cn(
            'px-3 py-1 text-xs font-medium transition-colors',
            mode === 'preview'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Preview
        </button>
      </div>
    </div>
  )
}
