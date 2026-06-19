import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { GoalCard } from '@/components/GoalCard'
import { EmptyState } from '@/components/EmptyState'
import { Target, Plus, X, Robot } from '@phosphor-icons/react'
import { CoachReport } from '@/components/CoachReport'
import { cn } from '@/lib/utils'
import { goalSchema, GOAL_CATEGORIES } from '@/lib/schemas'

export function GoalsPage() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(goalSchema),
    defaultValues: { title: '', category: 'weekly', deadline: '' },
  })

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => api.getGoals(),
  })

  const createMutation = useMutation({
    mutationFn: (data) => api.createGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      closeForm()
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.updateGoal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      closeForm()
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.deleteGoal(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  })

  const coachMutation = useMutation({
    mutationFn: () => api.getAICoach(),
  })

  function closeForm() {
    setShowForm(false)
    setEditing(null)
    reset()
  }

  function handleEdit(goal) {
    setEditing(goal)
    reset({
      title: goal.title,
      category: goal.category,
      deadline: goal.deadline ? goal.deadline.split('T')[0] : '',
    })
    setShowForm(true)
  }

  function handleToggle(goal) {
    updateMutation.mutate({
      id: goal.id,
      data: { status: goal.status === 'completed' ? 'active' : 'completed' },
    })
  }

  function onSubmit(data) {
    const payload = { title: data.title.trim(), category: data.category, deadline: data.deadline || null }
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const filtered = filter === 'all' ? goals : goals.filter((g) => g.category === filter)
  const active = filtered.filter((g) => g.status !== 'completed')
  const completed = filtered.filter((g) => g.status === 'completed')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Target weight="duotone" className="w-5 h-5 text-primary" />
          Goals
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => coachMutation.mutate()}
            disabled={coachMutation.isPending}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-border text-foreground hover:bg-accent transition-colors disabled:opacity-50"
          >
            {coachMutation.isPending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            ) : (
              <Robot weight="bold" className="w-4 h-4" />
            )}
            {coachMutation.isPending ? 'Coaching…' : 'Coach Me'}
          </button>
          <button
            onClick={() => { closeForm(); setShowForm(!showForm) }}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
              showForm
                ? 'bg-destructive/10 text-destructive'
                : 'bg-primary text-primary-foreground hover:opacity-90',
            )}
          >
            {showForm ? (
              <>
                <X weight="bold" className="w-4 h-4" />
                Cancel
              </>
            ) : (
              <>
                <Plus weight="bold" className="w-4 h-4" />
                New Goal
              </>
            )}
          </button>
        </div>
      </div>

      {/* Coach report */}
      {coachMutation.isError && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <p className="text-sm text-destructive flex items-center gap-1.5">
            {coachMutation.error.message.includes('not configured')
              ? 'OpenAI API key not configured. Add your key in Settings.'
              : coachMutation.error.message}
          </p>
        </div>
      )}
      {coachMutation.isPending && (
        <div className="rounded-xl border border-border bg-card p-5 animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-3 bg-muted rounded w-full" />
          <div className="h-3 bg-muted rounded w-5/6" />
          <div className="h-3 bg-muted rounded w-2/3" />
        </div>
      )}
      {coachMutation.data && (
        <CoachReport
          coach={coachMutation.data.coach}
          onClose={() => coachMutation.reset()}
        />
      )}

      {/* Goal form */}
      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div>
            <input
              type="text"
              placeholder="What do you want to achieve?"
              {...register('title')}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              autoFocus
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
            )}
          </div>
          <div className="flex gap-3">
            <select
              {...register('category')}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {GOAL_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
            <input
              type="date"
              {...register('deadline')}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending || !isValid}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {editing ? 'Update' : 'Create'}
            </button>
          </div>
          {(createMutation.isError || updateMutation.isError) && (
            <p className="text-sm text-destructive flex items-center gap-1.5">
              {createMutation.isError
                ? createMutation.error.message
                : updateMutation.error.message}
            </p>
          )}
          {saved && (
            <p className="text-sm text-emerald-500 font-medium">
              Goal {editing ? 'updated' : 'created'}!
            </p>
          )}
        </form>
      )}

      {/* Category filter tabs */}
      <div className="flex gap-1.5">
        {['all', ...GOAL_CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              filter === c
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            {c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {/* Goal list */}
      {deleteMutation.isError && (
          <p className="text-sm text-destructive flex items-center gap-1.5">
            Failed to delete goal. Please try again.
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
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No goals yet"
          description="Set a goal to start tracking your progress."
        />
      ) : (
        <div className="space-y-3">
          {active.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={deleteMutation.mutate}
            />
          ))}
          {completed.length > 0 && (
            <>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-2">
                Completed
              </h3>
              {completed.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onToggle={handleToggle}
                  onEdit={handleEdit}
                  onDelete={deleteMutation.mutate}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
