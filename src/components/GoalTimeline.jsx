import { cn } from '@/lib/utils'
import { CheckCircle, Calendar } from '@phosphor-icons/react'

const categoryColors = {
  weekly: 'border-violet-500 bg-violet-500/10',
  monthly: 'border-cyan-500 bg-cyan-500/10',
  yearly: 'border-rose-500 bg-rose-500/10',
}

const categoryDot = {
  weekly: 'bg-violet-500',
  monthly: 'bg-cyan-500',
  yearly: 'bg-rose-500',
}

export function GoalTimeline({ goals, onToggle, onEdit, onDelete }) {
  if (goals.length === 0) return null

  // Sort by deadline (if set), then by created_at
  const sorted = [...goals].sort((a, b) => {
    if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline)
    if (a.deadline) return -1
    if (b.deadline) return 1
    return a.created_at.localeCompare(b.created_at)
  })

  // Group by category
  const grouped = { weekly: [], monthly: [], yearly: [] }
  sorted.forEach((g) => {
    if (grouped[g.category]) grouped[g.category].push(g)
  })

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([category, items]) => {
        if (items.length === 0) return null
        return (
          <div key={category}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <div className={cn('w-2 h-2 rounded-full', categoryDot[category])} />
              {category.charAt(0).toUpperCase() + category.slice(1)} Goals
            </h3>
            <div className="relative ml-3">
              {/* Vertical line */}
              <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />

              <div className="space-y-4">
                {items.map((goal) => (
                  <TimelineItem
                    key={goal.id}
                    goal={goal}
                    onToggle={onToggle}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TimelineItem({ goal, onToggle, onEdit, onDelete }) {
  const isCompleted = goal.status === 'completed'
  const createdDate = new Date(goal.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const deadlineDate = goal.deadline
    ? new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  // Check if deadline is past
  const isOverdue = goal.deadline && !isCompleted && new Date(goal.deadline) < new Date()

  return (
    <div className="relative pl-6">
      {/* Dot on timeline */}
      <div
        className={cn(
          'absolute -left-[5px] top-3 w-[10px] h-[10px] rounded-full border-2 border-background',
          isCompleted ? 'bg-emerald-500' : isOverdue ? 'bg-red-500' : categoryDot[goal.category] || 'bg-primary',
        )}
      />

      <div
        className={cn(
          'rounded-lg border p-3 transition-colors group',
          isCompleted
            ? 'border-border bg-card/50 opacity-60'
            : 'border-border bg-card hover:border-muted-foreground/40',
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={cn('inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider', categoryColors[goal.category])}>
                {goal.category}
              </span>
              {isCompleted && (
                <CheckCircle weight="fill" className="w-3.5 h-3.5 text-emerald-500" />
              )}
              {isOverdue && (
                <span className="text-[10px] text-red-500 font-medium">Overdue</span>
              )}
            </div>
            <h4
              className={cn(
                'text-sm font-medium',
                isCompleted ? 'text-muted-foreground line-through' : 'text-foreground',
              )}
            >
              {goal.title}
            </h4>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span>Created {createdDate}</span>
              {deadlineDate && (
                <>
                  <span>·</span>
                  <span className={isOverdue ? 'text-red-500' : ''}>Due {deadlineDate}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onToggle(goal)}
              title={isCompleted ? 'Mark active' : 'Mark done'}
              className="p-1 rounded text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors"
            >
              <CheckCircle weight="duotone" className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onEdit(goal)}
              title="Edit"
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Calendar weight="duotone" className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(goal.id)}
              title="Delete"
              className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <span className="text-xs">×</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
