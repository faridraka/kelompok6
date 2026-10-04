import { useState } from 'react'
import { Link, NavLink } from 'react-router'
import Logo from '../Logo'
import { useCoachProfile } from '../../hooks/useCoachProfile'

const NAV_ITEMS = [
  { to: '/coach/dashboard', label: 'Dashboard' },
  { to: '/coach/schedule', label: 'Schedule' },
  { to: '/coach/records', label: 'Upload Record' },
  { to: '/coach/reviews', label: 'Review Player' },
  { to: '/coach/profile', label: 'Profile' },
]
const linkBase = 'font-display text-sm font-semibold uppercase tracking-wide transition-colors'

const CoachTopNav = () => {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const { data: coach } = useCoachProfile()
  const short = coach?.name.replace(/^Coach\s+/i, '') ?? '' // "Coach Faros" -> "Faros"

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-950/80 backdrop-blur-md">
      <nav aria-label="Coach" className="mx-auto flex h-20 max-w-[1650px] items-center justify-between gap-6 px-6 lg:px-8">
        <div className="flex items-center gap-10">
          <Link to="/" onClick={close} aria-label="MetaGames home" className="block shrink-0">
            <Logo className="h-12 w-auto lg:h-14" />
          </Link>
          <div className="hidden items-center gap-8 xl:flex">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `${linkBase} relative flex h-20 items-center ${isActive ? 'text-cyan-glow' : 'text-white/70 hover:text-white'}`}>
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-cyan-glow" aria-hidden="true" />}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Who is logged in. A link to the profile page. */}
        <NavLink to="/coach/profile" className={({ isActive }) => `hidden items-center gap-2 rounded-md border px-2 py-1.5 transition-colors xl:flex ${isActive ? 'border-white/30 text-white' : 'border-white/10 text-white/70 hover:border-white/30 hover:text-white'}`}>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 font-display text-xs font-bold text-white/70" aria-hidden="true">
            {coach?.avatar ? <img src={coach.avatar} alt="" className="h-full w-full object-cover" /> : short.slice(0, 2).toUpperCase()}
          </span>
          <span className={linkBase}>{short}</span>
        </NavLink>

        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="coach-mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'}
          className="flex h-11 w-11 items-center justify-center text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-glow xl:hidden">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d={open ? 'M5 5l14 14M19 5L5 19' : 'M4 7h16M4 12h16M4 17h16'} />
          </svg>
        </button>
      </nav>

      <div id="coach-mobile-menu" hidden={!open} className="border-t border-white/10 bg-navy-950/95 px-6 pb-4 pt-2 xl:hidden">
        <ul>
          {NAV_ITEMS.map((item) => (
            <li key={item.to} className="border-b border-white/10 last:border-b-0">
              <NavLink to={item.to} onClick={close} className={({ isActive }) => `${linkBase} block py-4 ${isActive ? 'text-cyan-glow' : 'text-white/70 hover:text-white'}`}>{item.label}</NavLink>
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}
export default CoachTopNav
