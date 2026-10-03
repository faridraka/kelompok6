import { useState } from 'react'
import { NavLink, Outlet, Link, useNavigate } from 'react-router'
import Logo from '../Logo'
import PlayerBackdrop from './PlayerBackdrop'
import { clearSession, getStoredUser } from '../../utils/session'

const I = (d) => <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
const QUICK = [
  { to: '/player/dashboard', label: 'Dashboard', icon: 'M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z' },
  { to: '/player/sessions', label: 'Sessions', icon: 'M8 2v3m8-3v3M3 8h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z' },
  { to: '/player/materials', label: 'Materials', icon: 'M4 5a2 2 0 012-2h12v18H6a2 2 0 01-2-2zM8 7h6M8 11h6' },
  { to: '/player/vods', label: 'Coaching VODs', icon: 'M4 6h12a2 2 0 012 2v8a2 2 0 01-2 2H4zM18 10l4-2v8l-4-2' },
]
const ACCOUNT = [{ to: '/player/account', label: 'My Account', icon: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c.8-4 3.8-6 8-6s7.2 2 8 6' }]

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

const NavItem = ({ item, onClick }) => (
  <NavLink to={item.to} onClick={onClick}
    className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 text-sm font-semibold transition-colors ${isActive ? 'bg-white/15 text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'}`}>
    {I(item.icon)}{item.label}
  </NavLink>
)

const Group = ({ title, items, close }) => (
  <div className="mt-8">
    <p className="mb-2 px-3 font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">{title}</p>
    {items.map((i) => <NavItem key={i.to} item={i} onClick={close} />)}
  </div>
)

const PlayerLayout = () => {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const user = getStoredUser()
  const close = () => setOpen(false)

  const handleLogout = () => {
    clearSession()
    navigate('/', { replace: true })
  }

  return (
    <div className="relative isolate min-h-screen bg-navy-950 lg:flex">
      <PlayerBackdrop />
      <header className="flex h-16 items-center justify-between bg-royal-600 px-4 lg:hidden">
        <Link to="/"><Logo className="h-9 w-auto" /></Link>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Toggle menu" className="h-10 w-10 text-white">
          <svg viewBox="0 0 24 24" className="mx-auto h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d={open ? 'M5 5l14 14M19 5L5 19' : 'M4 7h16M4 12h16M4 17h16'} /></svg>
        </button>
      </header>
      <aside className={`${open ? 'block' : 'hidden'} bg-linear-to-b from-royal-500 via-royal-600 to-royal-700 px-4 pb-6 pt-2 lg:sticky lg:top-0 lg:block lg:h-screen lg:w-60 lg:shrink-0 lg:overflow-y-auto lg:pt-6`}>
        <Link to="/" className="mb-8 hidden px-2 lg:block"><Logo className="h-10 w-auto" /></Link>
        <Group title="Quick links" items={QUICK} close={close} />
        <Group title="Account" items={ACCOUNT} close={close} />
        <div className="mt-8 border-t border-white/10 pt-4">
          {user && (
            <div className="px-3 mb-4 text-sm text-white/60">
              <p className="font-semibold text-white">{user.name}</p>
              <p className="text-xs text-white/50 truncate">{user.email}</p>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-semibold text-white/75 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogoutIcon />
            Logout
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-5 py-8 lg:px-10 lg:py-10"><Outlet /></main>
    </div>
  )
}
export default PlayerLayout
