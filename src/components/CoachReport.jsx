import { Robot, X } from '@phosphor-icons/react'

export function CoachReport({ coach, onClose }) {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 relative">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
            <Robot weight="fill" className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Coach Report</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <X weight="bold" className="w-4 h-4" />
        </button>
      </div>
      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
        {coach}
      </p>
    </div>
  )
}
