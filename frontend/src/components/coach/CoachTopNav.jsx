import { useState } from 'react'
import { Link, useLocation } from 'react-router'

import Logo from '../Logo'
import { coachProfile } from '../../data/coachDummyData'

const NAV_ITEMS = [
  { to: '/coach/dashboard', label: 'Dashboard' },
  { to: '/coach/services', label: 'My Services' },
  { to: '/coach/sessions', label: 'Sessions' },
  { to: '/coach/reviews', label: 'Performance Reviews' },
  { to: '/coach/wallet', label: 'Wallet' },
]

const PROFILE_PATH = '/coach/profile'

const AvatarBadge = ({ className = '' }) => (
  <span
    className={`flex h-7 w-7 shrink-0 items-center justify-center bg-royal-600 font-display text-xs font-bold text-white ${className}`}
    aria-hidden="true"
  >
    {coachProfile.avatarInitials}
  </span>
)

const NavItem = ({ item, active }) => (
  <Link
    to={item.to}
    className={`relative py-2 font-display text-sm font-semibold uppercase tracking-wide ${
      active
        ? 'text-cyan-glow'
        : 'text-white/70 hover:text-white'
    }`}
  >
    {item.label}

    {active && (
      <span
        className="absolute -bottom-px left-0 right-0 h-[2px] bg-cyan-glow"
        aria-hidden="true"
      />
    )}
  </Link>
)

const MobileNavItem = ({ item, active, onClick }) => (
  <li className="border-b border-white/10 last:border-b-0">
    <Link
      to={item.to}
      onClick={onClick}
      className={`block py-3 font-display text-sm font-semibold uppercase tracking-wide ${
        active ? 'text-cyan-glow' : 'text-white/70'
      }`}
    >
      {item.label}
    </Link>
  </li>
)

const CoachTopNav = () => {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (to) => location.pathname === to
  const closeMobile = () => setMobileOpen(false)

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-[92px] max-w-[1850px] items-center justify-between gap-6 px-6 lg:px-10">
        <Link
          to="/"
          aria-label="MetaGames home"
          className="shrink-0"
        >
          <Logo className="h-12 w-auto" />
        </Link>

        <nav
          aria-label="Coach navigation"
          className="hidden items-center gap-10 xl:flex"
        >
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.to}
              item={item}
              active={isActive(item.to)}
            />
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to={PROFILE_PATH}
            className={`hidden items-center gap-2 border px-4 py-2 xl:flex ${
              isActive(PROFILE_PATH)
                ? 'border-cyan-glow/50 text-white'
                : 'border-white/15 text-white/70 hover:border-white/30 hover:text-white'
            }`}
          >
            <AvatarBadge />

            <span className="font-display text-sm font-semibold uppercase tracking-wide">
              {coachProfile.name.split(' ')[0]}
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="flex h-10 w-10 items-center justify-center text-white xl:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {mobileOpen ? (
                <path d="M5 5l14 14M19 5L5 19" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          aria-label="Coach navigation mobile"
          className="border-t border-white/10 bg-navy-950/95 px-6 py-3 xl:hidden"
        >
          <ul className="flex flex-col">
            {NAV_ITEMS.map((item) => (
              <MobileNavItem
                key={item.to}
                item={item}
                active={isActive(item.to)}
                onClick={closeMobile}
              />
            ))}

            <li>
              <Link
                to={PROFILE_PATH}
                onClick={closeMobile}
                className={`flex items-center gap-2 py-3 font-display text-sm font-semibold uppercase tracking-wide ${
                  isActive(PROFILE_PATH)
                    ? 'text-cyan-glow'
                    : 'text-white/70'
                }`}
              >
                <AvatarBadge />
                Profile
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}

export default CoachTopNav