import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { FiDollarSign, FiGrid, FiCalendar, FiMenu, FiUser, FiX } from 'react-icons/fi'
import Logo from '../Logo' // sesuaikan path-nya

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Overview', icon: FiGrid },
  { to: '/dashboard/profile', label: 'Profile', icon: FiUser },
  { to: '/dashboard/sessions', label: 'Sessions', icon: FiCalendar },
  { to: '/dashboard/transactions', label: 'Transactions', icon: FiDollarSign },
]

const NavItem = ({ item, active, onClick }) => {
  const Icon = item.icon

  return (
    <Link
      to={item.to}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`group relative flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
        active ? 'bg-royal-500/10' : 'hover:bg-white/5'
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
          active
            ? 'bg-royal-500 text-white'
            : 'bg-white/10 text-white/60 group-hover:bg-royal-500/20 group-hover:text-white'
        }`}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>

      <p
        className={`flex-1 text-left font-display text-sm font-semibold uppercase tracking-wide ${
          active ? 'text-cyan-glow' : 'text-white/70 group-hover:text-white'
        }`}
      >
        {item.label}
      </p>

      {active && (
        <span className="absolute right-4 h-2 w-2 rounded-full bg-cyan-glow" aria-hidden="true" />
      )}
    </Link>
  )
}

const PlayerSidebar = () => {
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (to) =>
    to === '/dashboard' ? pathname === to : pathname.startsWith(to)
  const closeMobile = () => setMobileOpen(false)

  return (
    <>
      {/* Mobile header */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center bg-navy-950/80 px-6 backdrop-blur-md lg:hidden">
        <Link to="/" aria-label="MetaGames home">
          <Logo className="h-9 w-auto" />
        </Link>
      </header>

      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setMobileOpen((v) => !v)}
        aria-expanded={mobileOpen}
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-royal-500 text-white shadow-lg shadow-cyan-glow/30 hover:bg-royal-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-glow lg:hidden"
      >
        {mobileOpen ? (
          <FiX className="h-7 w-7" aria-hidden="true" />
        ) : (
          <FiMenu className="h-7 w-7" aria-hidden="true" />
        )}
      </button>

      {/* Overlay (mobile) */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-sm lg:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-dvh w-[280px] overflow-y-auto border-r border-white/5 bg-navy-900 p-6 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-8">
          <Link to="/" onClick={closeMobile} aria-label="MetaGames home">
            <Logo className="h-12 w-auto" />
          </Link>
          <p className="mt-1 pl-1 text-xs text-white/40">Player Portal</p>
        </div>

        <nav aria-label="Player dashboard" className="space-y-1">
          <p className="mb-2 px-4 font-display text-xs font-semibold uppercase tracking-[0.26em] text-white/40">
            Dashboard
          </p>
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.to}
              item={item}
              active={isActive(item.to)}
              onClick={closeMobile}
            />
          ))}
        </nav>
      </aside>
    </>
  )
}

export default PlayerSidebar
