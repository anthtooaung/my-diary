import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { EmptyState } from '@/components/EmptyState'
import { parseDate, cn } from '@/lib/utils'
import { MOODS, MOOD_LIST } from '@/lib/moods'
import {
  ChartBar,
  WarningOctagon,
  Smiley,
  CalendarDots,
  PencilLine,
  TextT,
  Target,
} from '@phosphor-icons/react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts'

// ── Chart colours (hex for SVG) ─────────────────────────────────────────────
const MOOD_CHART_COLORS = {
  happy: '#10b981',
  neutral: '#f59e0b',
  sad: '#60a5fa',
  anxious: '#fb923c',
  angry: '#ef4444',
  exhausted: '#a78bfa',
}

const CHART_MUTED = 'hsl(var(--muted-foreground))'

// ── Stop words ──────────────────────────────────────────────────────────────
const STOP_WORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'you', 'your', 'yours',
  'he', 'him', 'his', 'she', 'her', 'hers', 'it', 'its', 'they', 'them',
  'their', 'theirs', 'a', 'an', 'the', 'and', 'but', 'or', 'nor', 'not',
  'so', 'if', 'then', 'else', 'when', 'at', 'by', 'for', 'with', 'about',
  'to', 'from', 'of', 'in', 'on', 'off', 'up', 'down', 'out', 'over',
  'into', 'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 'have',
  'has', 'had', 'do', 'does', 'did', 'can', 'could', 'will', 'would',
  'should', 'may', 'might', 'that', 'this', 'these', 'those', 'just',
  'very', 'really', 'still', 'also', 'all', 'no', 'than', 'too', 'only',
  'some', 'any', 'such', 'both', 'few', 'more', 'most', 'other', 'each',
  'every', 'own', 'same', 'between', 'while', 'much', 'like', 'well',
  'even', 'because', 'got', 'get', 'gets', 'it\'s', 'don\'t', 'didn\'t',
  'wasn\'t', 'weren\'t', 'what', 'who', 'how', 'where', 'why', 'which',
  'there', 'here', 'now', 'today', 'yesterday', 'tomorrow', 'day', 'night',
])

// ── Helpers ─────────────────────────────────────────────────────────────────
function toDateStr(date) {
  return date.toISOString().split('T')[0]
}

function getMonday(dateStr) {
  const d = parseDate(dateStr)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const mon = new Date(d.setDate(diff))
  return toDateStr(mon)
}

function formatWeekLabel(dateStr) {
  const d = parseDate(dateStr)
  const end = new Date(d)
  end.setDate(end.getDate() + 6)
  const startLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endLabel = end.toLocaleDateString('en-US', { day: 'numeric' })
  return `${startLabel}–${endLabel}`
}

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

// ── Skeleton component ──────────────────────────────────────────────────────
function ChartSkeleton({ height = 'h-64' }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 animate-pulse">
      <div className={cn('bg-muted rounded', height)} />
    </div>
  )
}

// ── Section wrapper ─────────────────────────────────────────────────────────
function ChartSection({ icon: Icon, title, children }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <Icon weight="duotone" className="w-4 h-4" />
        {title}
      </h3>
      {children}
    </div>
  )
}

// ── 1. Mood Distribution Pie ────────────────────────────────────────────────
function MoodPie({ entries }) {
  const moodCounts = useMemo(() => {
    const counts = {}
    entries.forEach((e) => {
      if (e.mood) counts[e.mood] = (counts[e.mood] || 0) + 1
    })
    return MOOD_LIST.map((m) => ({
      name: m.label,
      value: counts[m.value] || 0,
      mood: m.value,
    })).filter((d) => d.value > 0)
  }, [entries])

  if (moodCounts.length === 0) {
    return (
      <EmptyState
        icon={Smiley}
        title="No mood data yet"
        description="Add moods to your entries to see the distribution here."
      />
    )
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={moodCounts}
          cx="50%"
          cy="50%"
          innerRadius={56}
          outerRadius={96}
          paddingAngle={3}
          dataKey="value"
          stroke="none"
        >
          {moodCounts.map((entry) => (
            <Cell key={entry.mood} fill={MOOD_CHART_COLORS[entry.mood]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.5rem',
            fontSize: '0.8125rem',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Legend
          wrapperStyle={{ fontSize: '0.8125rem' }}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

// ── 2. Entries Per Week Bar ─────────────────────────────────────────────────
function EntriesPerWeek({ entries }) {
  const weeklyData = useMemo(() => {
    const weeks = {}
    entries.forEach((e) => {
      const mon = getMonday(e.created_at)
      weeks[mon] = (weeks[mon] || 0) + 1
    })
    return Object.entries(weeks)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([week, count]) => ({ week: formatWeekLabel(week), count }))
  }, [entries])

  if (weeklyData.length < 2) {
    return (
      <EmptyState
        icon={CalendarDots}
        title="Need more weeks"
        description="Write entries across multiple weeks to see the trend."
      />
    )
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={weeklyData} margin={{ top: 4, right: 4, bottom: 4, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 11, fill: CHART_MUTED }}
          angle={-40}
          textAnchor="end"
          height={70}
          interval={0}
        />
        <YAxis tick={{ fontSize: 11, fill: CHART_MUTED }} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.5rem',
            fontSize: '0.8125rem',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── 3. Word Count Trend ─────────────────────────────────────────────────────
function WordCountTrend({ entries }) {
  const trendData = useMemo(() => {
    return entries
      .slice()
      .reverse()
      .map((e) => ({
        date: parseDate(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        words: wordCount(e.content),
      }))
  }, [entries])

  if (trendData.length < 3) {
    return (
      <EmptyState
        icon={PencilLine}
        title="Write more entries"
        description="You need at least 3 entries to see a word count trend."
      />
    )
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={trendData} margin={{ top: 4, right: 4, bottom: 4, left: -8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: CHART_MUTED }}
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fontSize: 11, fill: CHART_MUTED }} />
        <Tooltip
          contentStyle={{
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.5rem',
            fontSize: '0.8125rem',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Line
          type="monotone"
          dataKey="words"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ r: 3, fill: 'hsl(var(--primary))' }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ── 4. Top Words ────────────────────────────────────────────────────────────
function TopWords({ entries }) {
  const wordFreq = useMemo(() => {
    const freq = {}
    entries.forEach((e) => {
      e.content.toLowerCase().split(/[^a-z']+/).forEach((w) => {
        if (w.length < 3 || STOP_WORDS.has(w)) return
        freq[w] = (freq[w] || 0) + 1
      })
    })
    return Object.entries(freq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([word, count]) => ({ word, count }))
  }, [entries])

  if (wordFreq.length === 0) {
    return (
      <EmptyState
        icon={TextT}
        title="No words to analyze"
        description="Write longer entries to see your most-used words."
      />
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={wordFreq}
        layout="vertical"
        margin={{ top: 4, right: 4, bottom: 4, left: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: CHART_MUTED }} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="word"
          tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
          width={90}
        />
        <Tooltip
          contentStyle={{
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.5rem',
            fontSize: '0.8125rem',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── 5. Goal Completion ──────────────────────────────────────────────────────
function GoalCompletion({ goals }) {
  const stats = useMemo(() => {
    const total = goals.length
    const completed = goals.filter((g) => g.status === 'completed').length
    const active = goals.filter((g) => g.status === 'active').length
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0
    return { total, completed, active, rate }
  }, [goals])

  if (goals.length === 0) {
    return (
      <EmptyState
        icon={Target}
        title="No goals set yet"
        description="Set goals on the Goals page to track your completion rate."
      />
    )
  }

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-muted/50 p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="rounded-lg bg-emerald-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.completed}</p>
          <p className="text-xs text-muted-foreground">Done</p>
        </div>
        <div className="rounded-lg bg-primary/10 p-3 text-center">
          <p className="text-2xl font-bold text-primary">{stats.active}</p>
          <p className="text-xs text-muted-foreground">Active</p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted-foreground">Completion rate</span>
          <span className="text-xs font-semibold text-foreground">{stats.rate}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${stats.rate}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// ── 6. Mood Calendar Heatmap ────────────────────────────────────────────────
function MoodHeatmap({ moods }) {
  const months = useMemo(() => {
    const now = new Date()
    const result = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      result.push({
        label: d.toLocaleDateString('en-US', { month: 'short' }),
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        days: new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(),
      })
    }

    // Build lookup: dateStr → mood value
    const moodMap = {}
    moods.forEach((m) => {
      moodMap[m.date] = m.mood
    })

    return result.map((mon) => ({
      ...mon,
      cells: Array.from({ length: mon.days }, (_, i) => {
        const day = i + 1
        const dateStr = `${mon.year}-${String(mon.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        return {
          day,
          date: dateStr,
          mood: moodMap[dateStr] || null,
        }
      }),
    }))
  }, [moods])

  if (moods.length === 0) {
    return (
      <EmptyState
        icon={CalendarDots}
        title="No mood data"
        description="Add moods to your entries to see your year in colour."
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      {/* Column headers (day numbers) */}
      <div className="flex items-end gap-px mb-1 ml-10">
        {Array.from({ length: 31 }, (_, i) => (
          <div
            key={i}
            className="w-5 text-center text-[10px] text-muted-foreground leading-none"
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Month rows */}
      <div className="space-y-px">
        {months.map((mon) => (
          <div key={mon.label} className="flex items-center gap-2">
            <span className="w-9 text-right text-[11px] text-muted-foreground shrink-0 leading-none">
              {mon.label}
            </span>
            <div className="flex gap-px">
              {mon.cells.map((cell) => (
                <div
                  key={cell.date}
                  title={`${cell.date}${cell.mood ? ` — ${MOODS[cell.mood]?.label || cell.mood}` : ''}`}
                  className={cn(
                    'w-5 h-5 rounded-sm transition-colors',
                    cell.mood
                      ? MOODS[cell.mood]?.dotClass || 'bg-muted'
                      : 'bg-muted/30',
                  )}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-4 ml-10">
        {MOOD_LIST.map((m) => (
          <div key={m.value} className="flex items-center gap-1">
            <div className={cn('w-3 h-3 rounded-sm', m.dotClass)} />
            <span className="text-[10px] text-muted-foreground">{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────
export function StatsPage() {
  const { data: entries = [], isLoading: entriesLoading, isError: entriesError } = useQuery({
    queryKey: ['entries'],
    queryFn: () => api.getEntries(),
  })

  const { data: goals = [], isLoading: goalsLoading, isError: goalsError } = useQuery({
    queryKey: ['goals'],
    queryFn: () => api.getGoals(),
  })

  const oneYearAgo = toDateStr(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000))
  const today = toDateStr(new Date())

  const { data: moods = [], isLoading: moodsLoading, isError: moodsError } = useQuery({
    queryKey: ['moods', 'stats', oneYearAgo, today],
    queryFn: () => api.getMoods({ start: oneYearAgo, end: today }),
  })

  const isLoading = entriesLoading || goalsLoading || moodsLoading
  const hasError = entriesError || goalsError || moodsError

  return (
    <div className="space-y-6">
      {/* Header */}
      <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
        <ChartBar weight="duotone" className="w-5 h-5 text-primary" />
        Stats
      </h2>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton height="h-40" />
        </div>
      ) : hasError ? (
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-destructive flex items-center gap-1.5">
            <WarningOctagon weight="fill" className="w-4 h-4" />
            Failed to load stats data. Please try again.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Row 1: Mood Pie + Entries Per Week */}
          <ChartSection icon={Smiley} title="Mood Distribution">
            <MoodPie entries={entries} />
          </ChartSection>
          <ChartSection icon={CalendarDots} title="Entries per Week">
            <EntriesPerWeek entries={entries} />
          </ChartSection>

          {/* Row 2: Word Count Trend + Top Words */}
          <ChartSection icon={PencilLine} title="Word Count Trend">
            <WordCountTrend entries={entries} />
          </ChartSection>
          <ChartSection icon={TextT} title="Top Words">
            <TopWords entries={entries} />
          </ChartSection>

          {/* Row 3: Goal Completion + spacer (force same grid alignment) */}
          <ChartSection icon={Target} title="Goal Completion">
            <GoalCompletion goals={goals} />
          </ChartSection>

          {/* Row 4: Mood Heatmap — full width */}
          <div className="lg:col-span-2">
            <ChartSection icon={CalendarDots} title="Mood Heatmap (Last 12 Months)">
              <MoodHeatmap moods={moods} />
            </ChartSection>
          </div>
        </div>
      )}
    </div>
  )
}
