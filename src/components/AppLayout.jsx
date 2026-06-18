import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { List, X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar — hidden on mobile, visible on md+ */}
      <div
        className={cn(
          'fixed inset-0 z-40 transition-opacity md:hidden',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
        {/* Sidebar panel */}
        <div className="relative h-full w-56">
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </div>
      </div>

      {/* Desktop sidebar — always visible */}
      <div className="hidden md:flex h-full shrink-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* Mobile header with hamburger */}
        <div className="flex items-center md:hidden mb-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
          >
            <List weight="bold" className="w-5 h-5" />
          </button>
        </div>
        <div className="max-w-4xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
