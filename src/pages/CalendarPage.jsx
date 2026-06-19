import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { MoodDot } from '@/components/MoodDot'
import { MoodBadge } from '@/components/MoodBadge'
import { MarkdownContent } from '@/components/MarkdownContent'
import { EmptyState } from '@/components/EmptyState'
import { CalendarDots, CaretLeft, CaretRight, WarningOctagon } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Fetch moods for this month
  const start = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const end = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`
  const { data: moods = [], isError: moodsError } = useQuery({
    queryKey: ['moods', start, end],
    queryFn: () => api.getMoods({ start, end }),
  })

  // Fetch entry for selected date
  const { data: dayEntry, isError: dayEntryError } = useQuery({
    queryKey: ['entry', selectedDate],
    queryFn: () => api.getEntries({ date: selectedDate }),
    enabled: !!selectedDate,
    select: (entries) => entries?.[0] ?? null,
  })

  const moodByDate = {}
  moods.forEach((m) => {
    moodByDate[m.date] = m.mood
  })

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1))
    setSelectedDate(null)
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1))
    setSelectedDate(null)
  }

  const firstDay = new Date(year, month, 1).getDay()
  const monthLabel = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
        <CalendarDots weight="duotone" className="w-5 h-5 text-primary" />
        Calendar
      </h2>

      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors">
          <CaretLeft weight="bold" className="w-5 h-5" />
        </button>
        <span className="text-sm font-semibold text-foreground">{monthLabel}</span>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors">
          <CaretRight weight="bold" className="w-5 h-5" />
        </button>
      </div>

      {/* Day-of-week header */}
      <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      {moodsError && (
        <p className="text-sm text-destructive flex items-center gap-1.5 mb-2">
          <WarningOctagon weight="fill" className="w-4 h-4" />
          Failed to load moods. Please try refreshing.
        </p>
      )}

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for offset */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const mood = moodByDate[dateStr]
          const isToday = dateStr === todayStr
          const isSelected = dateStr === selectedDate

          return (
            <button
              key={day}
              onClick={() => setSelectedDate(isSelected ? null : dateStr)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 aspect-square rounded-xl text-sm transition-colors',
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : isToday
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent text-foreground',
              )}
            >
              <span className="text-xs font-medium">{day}</span>
              {mood && <MoodDot mood={mood} size="sm" />}
            </button>
          )
        })}
      </div>

      {/* Selected day detail */}
      {selectedDate && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </h3>
          {dayEntryError ? (
            <p className="text-sm text-destructive flex items-center gap-1.5">
              <WarningOctagon weight="fill" className="w-4 h-4" />
              Failed to load entry for this day.
            </p>
          ) : dayEntry ? (
            <div className="space-y-2">
              {dayEntry.mood && <MoodBadge mood={dayEntry.mood} size="md" />}
              <MarkdownContent>{dayEntry.content}</MarkdownContent>
            </div>
          ) : (
            <EmptyState
              icon={CalendarDots}
              title="No entry"
              description="You didn&apos;t write anything on this day."
            />
          )}
        </div>
      )}
    </div>
  )
}
