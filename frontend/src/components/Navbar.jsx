import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import Logo from './Logo'

const NAV_LINKS = [
  { label: 'Find your coach', to: '/coaches' },
  { label: 'Apply as a coach', to: '/register?role=coach' },
  { label: 'How it works', href: '#how-it-works' },
]

const LOGIN_PATH = '/login'

const linkClass =
  'font-display text-[13px] font-semibold uppercase tracking-wide text-white transition-colors hover:text-cyan-glow focus-visible:text-cyan-glow focus-visible:outline-none'

const ArrowIcon = () => (
  <svg viewBox="0 0 8 12" className="h-3 w-2 fill-current" aria-hidden="true">
    <path d="M0 0l8 6-8 6z" />
  </svg>
)

const NavItem = ({ item, onClick, className }) =>
  item.to ? (
    <Link to={item.to} onClick={onClick} className={className}>
      {item.label}
    </Link>
  ) : (
    <a href={item.href} onClick={onClick} className={className}>
      {item.label}
    </a>
  )

const LoginButton = ({ onClick, className = '' }) => (
  <Link
    to={LOGIN_PATH}
    onClick={onClick}
    className={`items-center justify-center gap-4 bg-royal-500 px-5 py-[18px] font-display text-[17px] font-semibold uppercase leading-none tracking-wide text-white transition-colors hover:bg-royal-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-glow ${className}`}
  >
    Member login
    <ArrowIcon />
  </Link>
)

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="sticky top-0 z-50 bg-navy-950/90 backdrop-blur">
      <nav
        aria-label="Main"
        className="mx-auto flex h-20 max-w-[1650px] items-center justify-between px-6 lg:px-8"
      >
        <div className="flex items-center">
          <Link to="/" onClick={close} aria-label="MetaGames home" className="block">
            <Logo className="h-12 w-auto lg:h-14" />
          </Link>

          <ul className="ml-8 hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map((item) => (
              <li key={item.label}>
                <NavItem item={item} className={linkClass} />
              </li>
            ))}
          </ul>
        </div>

        <LoginButton className="hidden lg:inline-flex" />

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="flex h-11 w-11 items-center justify-center text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-glow lg:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {open ? (
              <path d="M5 5l14 14M19 5L5 19" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </nav>

      <div
        id="mobile-menu"
        hidden={!open}
        className="border-t border-white/10 bg-navy-950/95 px-6 pb-6 pt-2 lg:hidden"
      >
        <ul className="flex flex-col">
          {NAV_LINKS.map((item) => (
            <li key={item.label} className="border-b border-white/10">
              <NavItem item={item} onClick={close} className={`${linkClass} block py-4`} />
            </li>
          ))}
        </ul>
        <LoginButton onClick={close} className="mt-6 flex w-full" />
      </div>
    </header>
  )
}

export default Navbar
