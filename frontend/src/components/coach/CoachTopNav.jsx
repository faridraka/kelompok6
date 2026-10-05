import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { FiMenu, FiX, FiLogOut, FiChevronDown } from 'react-icons/fi'

import Logo from '../Logo'
import { getStoredUser, clearSession } from '../../utils/session'

const NAV_ITEMS = [
  { to: '/coach/dashboard', label: 'Dashboard' },
  { to: '/coach/schedule', label: 'Schedule' },
  { to: '/coach/records', label: 'Upload Record' },
  { to: '/coach/reviews', label: 'Review Player' },
  { to: '/coach/profile', label: 'Profile' },
]

const PROFILE_PATH = '/coach/profile'

const getInitials = (name) => {
  if (!name) return 'CO'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const AvatarBadge = ({ name, className = '' }) => (
  <span
    className={`flex h-7 w-7 shrink-0 items-center justify-center bg-royal-600 font-display text-xs font-bold text-white ${className}`}
    aria-hidden="true"
  >
    {getInitials(name)}
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
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const user = getStoredUser()

  const isActive = (to) => location.pathname === to
  const closeMobile = () => setMobileOpen(false)
  const closeProfile = () => setProfileOpen(false)

  const handleLogout = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-[92px] max-w-[1850px] items-center justify-between gap-6 px-6 lg:px-10">
        <Link
          to="/coach/dashboard"
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
          {/* Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              aria-expanded={profileOpen}
              aria-label="Profile menu"
              className={`hidden items-center gap-2 border px-4 py-2 xl:flex ${
                isActive(PROFILE_PATH)
                  ? 'border-cyan-glow/50 text-white'
                  : 'border-white/15 text-white/70 hover:border-white/30 hover:text-white'
              }`}
            >
              <AvatarBadge name={user?.name} />

              <span className="font-display text-sm font-semibold uppercase tracking-wide">
                {user?.name?.split(' ')[0] || 'Coach'}
              </span>
              <FiChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 border border-white/10 bg-navy-950/95 backdrop-blur rounded-md overflow-hidden z-50">
                <Link
                  to={PROFILE_PATH}
                  onClick={closeProfile}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold uppercase tracking-wide ${
                    isActive(PROFILE_PATH)
                      ? 'text-cyan-glow'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <AvatarBadge name={user?.name} className="h-6 w-6" />
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white/75 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <FiLogOut className="h-4 w-4" aria-hidden="true" />
                  Logout
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="flex h-10 w-10 items-center justify-center text-white xl:hidden"
          >
            {mobileOpen ? <FiX className="h-6 w-6" aria-hidden="true" /> : <FiMenu className="h-6 w-6" aria-hidden="true" />}
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
                <AvatarBadge name={user?.name} />
                Profile
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 py-3 font-display text-sm font-semibold uppercase tracking-wide text-white/75 hover:text-white"
              >
                <FiLogOut className="h-5 w-5" aria-hidden="true" />
                Logout
              </button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
export default CoachTopNav
