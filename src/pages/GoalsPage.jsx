import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { GoalCard } from '@/components/GoalCard'
import { EmptyState } from '@/components/EmptyState'
import { Target, Plus, X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

const categories = ['weekly', 'monthly', 'yearly']

export function GoalsPage() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('weekly')
  const [deadline, setDeadline] = useState('')

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => api.getGoals(),
  })

  const createMutation = useMutation({
    mutationFn: (data) => api.createGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      resetForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.updateGoal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      resetForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.deleteGoal(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  })

  function resetForm() {
    setShowForm(false)
    setEditing(null)
    setTitle('')
    setCategory('weekly')
    setDeadline('')
  }

  function handleEdit(goal) {
    setEditing(goal)
    setTitle(goal.title)
    setCategory(goal.category)
    setDeadline(goal.deadline ? goal.deadline.split('T')[0] : '')
    setShowForm(true)
  }

  function handleToggle(goal) {
    updateMutation.mutate({
      id: goal.id,
      data: { status: goal.status === 'completed' ? 'active' : 'completed' },
    })
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    const data = { title: title.trim(), category, deadline: deadline || null }
    if (editing) {
      updateMutation.mutate({ id: editing.id, data })
    } else {
      createMutation.mutate(data)
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
        <button
          onClick={() => { resetForm(); setShowForm(!showForm) }}
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

      {/* Goal form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div>
            <input
              type="text"
              placeholder="What do you want to achieve?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              autoFocus
            />
          </div>
          <div className="flex gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending || !title.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      )}

      {/* Category filter tabs */}
      <div className="flex gap-1.5">
        {['all', ...categories].map((c) => (
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
