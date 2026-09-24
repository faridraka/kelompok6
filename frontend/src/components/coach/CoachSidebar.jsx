// CoachSidebar
// Sidebar navigasi untuk seluruh Coach Perspective.
// Didesain mengikuti pola visual landing page:
// bg-navy-950, border white/10, font-display uppercase, aksen cyan-glow.

import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import Logo from '../Logo'

const NAV_ITEMS = [
  {
    to: '/coach/dashboard',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    to: '/coach/services',
    label: 'My Services',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    to: '/coach/sessions',
    label: 'Sessions',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    to: '/coach/reviews',
    label: 'Performance Reviews',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    to: '/coach/wallet',
    label: 'Wallet',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
        <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    to: '/coach/profile',
    label: 'Profile',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
]

// Satu item nav di sidebar
const NavItem = ({ item, active, onClick }) => (
  <li>
    <Link
      to={item.to}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 font-display text-[13px] font-semibold uppercase tracking-wide transition-colors ${
        active
          ? 'bg-royal-600 text-white'
          : 'text-white/60 hover:bg-navy-800 hover:text-white'
      }`}
    >
      <span className={active ? 'text-cyan-glow' : 'text-white/40'}>
        {item.icon}
      </span>
      {item.label}
    </Link>
  </li>
)

const CoachSidebar = () => {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (to) => location.pathname === to

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-white/10 bg-navy-950 lg:flex xl:w-60">
        {/* Logo */}
        <div className="border-b border-white/10 px-4 py-5">
          <Link to="/" aria-label="MetaGames home">
            <Logo className="h-10 w-auto" />
          </Link>
        </div>

        {/* Label section */}
        <div className="px-4 pb-1 pt-5">
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.28em] text-white/25">
            Coach Panel
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto">
          <ul>
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.to} item={item} active={isActive(item.to)} />
            ))}
          </ul>
        </nav>

        {/* Footer sidebar — back to site */}
        <div className="border-t border-white/10 px-4 py-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs text-white/30 transition-colors hover:text-white/60"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-3 w-3" aria-hidden="true">
              <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to site
          </Link>
        </div>
      </aside>

      {/* ── MOBILE TOP BAR ── */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-navy-950 px-4 lg:hidden">
        <Link to="/" aria-label="MetaGames home">
          <Logo className="h-8 w-auto" />
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          className="flex h-9 w-9 items-center justify-center text-white"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {mobileOpen
              ? <path d="M5 5l14 14M19 5L5 19" />
              : <path d="M4 7h16M4 12h16M4 17h16" />
            }
          </svg>
        </button>
      </div>

      {/* ── MOBILE DRAWER ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          {/* overlay */}
          <div
            className="absolute inset-0 bg-navy-950/80"
            onClick={() => setMobileOpen(false)}
          />
          {/* drawer */}
          <nav className="absolute left-0 top-14 h-[calc(100%-3.5rem)] w-56 overflow-y-auto border-r border-white/10 bg-navy-950">
            <div className="px-4 pb-1 pt-4">
              <p className="font-display text-[10px] font-bold uppercase tracking-[0.28em] text-white/25">
                Coach Panel
              </p>
            </div>
            <ul>
              {NAV_ITEMS.map((item) => (
                <NavItem
                  key={item.to}
                  item={item}
                  active={isActive(item.to)}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
            </ul>
          </nav>
        </div>
      )}
    </>
  )
}

export default CoachSidebar
