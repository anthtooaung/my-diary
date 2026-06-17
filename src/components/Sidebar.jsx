import { NavLink } from 'react-router-dom'
import {
  House,
  CalendarDots,
  Target,
  NewspaperClipping,
  MagnifyingGlass,
  Gear,
  SignOut,
} from '@phosphor-icons/react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: House },
  { to: '/calendar', label: 'Calendar', icon: CalendarDots },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/digest', label: 'Digest', icon: NewspaperClipping },
  { to: '/search', label: 'Search', icon: MagnifyingGlass },
  { to: '/settings', label: 'Settings', icon: Gear },
]

export function Sidebar() {
  const { logout } = useAuth()

  return (
    <aside className="flex flex-col h-full border-r border-border bg-card w-56 shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
          <span className="text-primary-foreground text-sm font-bold">D</span>
        </div>
        <span className="font-semibold text-lg text-foreground">My Diary</span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )
            }
          >
            <Icon weight="duotone" className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-border">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <SignOut weight="duotone" className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  )
}
