import { CheckCircle, Pencil, Trash } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

const categoryConfig = {
  weekly: { label: 'Weekly', className: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20' },
  monthly: { label: 'Monthly', className: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20' },
  yearly: { label: 'Yearly', className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
}

export function GoalCard({ goal, onToggle, onEdit, onDelete }) {
  const cat = categoryConfig[goal.category] ?? categoryConfig.weekly

  return (
    <div
      className={cn(
        'rounded-xl border p-5 transition-colors',
        goal.status === 'completed'
          ? 'border-border bg-card/50 opacity-60'
          : 'border-border bg-card hover:border-muted-foreground/40',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider', cat.className)}>
              {cat.label}
            </span>
            {goal.status === 'completed' && (
              <CheckCircle weight="fill" className="w-4 h-4 text-emerald-500" />
            )}
          </div>
          <h3
            className={cn(
              'text-sm font-medium',
              goal.status === 'completed' ? 'text-muted-foreground line-through' : 'text-foreground',
            )}
          >
            {goal.title}
          </h3>
          {goal.deadline && (
            <p className="text-xs text-muted-foreground mt-1">
              Due: {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onToggle(goal)}
            title={goal.status === 'completed' ? 'Mark active' : 'Mark done'}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors"
          >
            <CheckCircle weight="duotone" className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(goal)}
            title="Edit goal"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Pencil weight="duotone" className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            title="Delete goal"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash weight="duotone" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
