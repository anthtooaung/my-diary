import { useState, useCallback } from 'react'
import { Lightbulb, ArrowCounterClockwise } from '@phosphor-icons/react'
import { pickPrompt } from '@/lib/prompts'

export function WritingPromptCard({ lastMood }) {
  const [prompt, setPrompt] = useState(() => pickPrompt({ mood: lastMood }))

  const shuffle = useCallback(() => {
    setPrompt(pickPrompt({ mood: lastMood }))
  }, [lastMood])

  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 shrink-0 mt-0.5">
        <Lightbulb weight="duotone" className="w-5 h-5 text-amber-500" />
      </div>
      <p className="text-sm text-foreground leading-relaxed min-w-0 flex-1">
        {prompt}
      </p>
      <button
        onClick={shuffle}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
        title="New prompt"
      >
        <ArrowCounterClockwise weight="bold" className="w-4 h-4" />
      </button>
    </div>
  )
}
