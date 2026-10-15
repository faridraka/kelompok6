import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { FiMenu, FiX, FiLogOut, FiUser, FiChevronDown } from 'react-icons/fi'

import Logo from '../Logo'
import { clearSession } from '../../utils/session'
import { useCoachProfile } from '../../hooks/useCoachProfile'

const NAV_ITEMS = [
  { to: '/coach/dashboard', label: 'Dashboard' },
  { to: '/coach/schedule', label: 'Schedule' },
  { to: '/coach/records', label: 'Upload Record' },
  { to: '/coach/reviews', label: 'Review Player' },
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

const Avatar = ({ name, src, className = 'h-8 w-8' }) => {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={`${className} shrink-0 rounded-full border border-white/10 object-cover`}
      />
    )
  }
  return (
    <span
      className={`${className} flex shrink-0 items-center justify-center rounded-full bg-royal-600 font-display text-xs font-bold text-white`}
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  )
}

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
  const menuRef = useRef(null)
  const { data: profile, loading: profileLoading } = useCoachProfile()

  const coachName = profile?.name ?? null
  const avatarSrc = profile?.avatar ?? profile?.avatarUrl ?? null
  const firstName = coachName?.split(' ')[0] ?? null

  const isActive = (to) => location.pathname === to
  const closeMobile = () => setMobileOpen(false)

  const handleLogout = () => {
    setProfileOpen(false)
    clearSession()
    navigate('/login', { replace: true })
  }

  // Close on route change (deferred so the update runs in a callback, not synchronously in the effect).
  useEffect(() => {
    const id = window.setTimeout(() => setProfileOpen(false), 0)
    return () => window.clearTimeout(id)
  }, [location.pathname])

  useEffect(() => {
    if (!profileOpen) return undefined
    const onPointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setProfileOpen(false)
      }
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setProfileOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [profileOpen])

  const showPlaceholder = profileLoading && !profile

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
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              aria-label="Profile menu"
              className={`hidden items-center gap-2 border px-4 py-2 xl:flex ${
                isActive(PROFILE_PATH)
                  ? 'border-cyan-glow/50 text-white'
                  : 'border-white/15 text-white/70 hover:border-white/30 hover:text-white'
              }`}
            >
              {showPlaceholder ? (
                <>
                  <span className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-white/10" aria-hidden="true" />
                  <span className="h-4 w-16 animate-pulse rounded bg-white/10" aria-hidden="true" />
                </>
              ) : (
                <>
                  <Avatar name={coachName} src={avatarSrc} />
                  <span className="max-w-[120px] truncate font-display text-sm font-semibold uppercase tracking-wide">
                    {firstName || 'Coach'}
                  </span>
                </>
              )}
              <FiChevronDown
                className={`h-4 w-4 shrink-0 transition-transform ${profileOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>

            {profileOpen && (
              <div
                role="menu"
                aria-label="Profile menu"
                className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-md border border-white/10 bg-navy-950/95 backdrop-blur"
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  <Avatar name={coachName} src={avatarSrc} className="h-10 w-10" />
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-semibold uppercase tracking-wide text-white">
                      {coachName || 'Coach'}
                    </p>
                    <p className="font-display text-xs uppercase tracking-wide text-white/50">
                      Coach
                    </p>
                  </div>
                </div>

                <div className="border-t border-white/10" />

                <Link
                  to={PROFILE_PATH}
                  role="menuitem"
                  onClick={() => setProfileOpen(false)}
                  className={`flex items-center gap-2 px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-wide ${
                    isActive(PROFILE_PATH)
                      ? 'text-cyan-glow'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <FiUser className="h-4 w-4" aria-hidden="true" />
                  Profile
                </Link>

                <div className="border-t border-white/10" />

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-white/75 transition-colors hover:bg-white/10 hover:text-white"
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
            <li className="border-b border-white/10">
              <Link
                to={PROFILE_PATH}
                onClick={closeMobile}
                className={`flex items-center gap-2 py-3 font-display text-sm font-semibold uppercase tracking-wide ${
                  isActive(PROFILE_PATH)
                    ? 'text-cyan-glow'
                    : 'text-white/70'
                }`}
              >
                {showPlaceholder ? (
                  <span className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-white/10" aria-hidden="true" />
                ) : (
                  <Avatar name={coachName} src={avatarSrc} />
                )}
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
