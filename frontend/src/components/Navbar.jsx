import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import Logo from './Logo'
import { isAuthenticated, getUserRole } from '../utils/session'
import { FiChevronRight, FiMenu, FiX } from 'react-icons/fi'

const NAV_LINKS = [
  { label: 'Find your coach', to: '/coaches' },
  { label: 'Choose your role', href: '/#choose-your-role' },
  { label: 'How it works', href: '/#how-it-works' },
]

const linkClass =
  'font-display text-[13px] font-semibold uppercase tracking-wide text-white transition-colors hover:text-cyan-glow focus-visible:text-cyan-glow focus-visible:outline-none'

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

const AuthButton = ({ onClick, className = '' }) => {
  const navigate = useNavigate()
  const loggedIn = isAuthenticated()
  const role = getUserRole()

  const handleClick = (e) => {
    e.preventDefault()
    if (onClick) onClick()
    if (loggedIn) {
      navigate(role === 'coach' ? '/coach/dashboard' : '/player/dashboard', { replace: true })
    } else {
      navigate('/register')
    }
  }

  if (loggedIn) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`items-center justify-center gap-4 bg-royal-500 px-5 py-[18px] font-display text-[17px] font-semibold uppercase leading-none tracking-wide text-white transition-colors hover:bg-royal-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-glow ${className}`}
      >
        DASHBOARD
        <FiChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    )
  }

  return (
    <Link
      to="/register"
      onClick={onClick}
      className={`items-center justify-center gap-4 bg-royal-500 px-5 py-[18px] font-display text-[17px] font-semibold uppercase leading-none tracking-wide text-white transition-colors hover:bg-royal-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-glow ${className}`}
    >
      JOIN NOW
      <FiChevronRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  )
}

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

        <AuthButton className="hidden lg:inline-flex" />

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="flex h-11 w-11 items-center justify-center text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-glow lg:hidden"
        >
          {open ? (
            <FiX className="h-7 w-7" aria-hidden="true" />
          ) : (
            <FiMenu className="h-7 w-7" aria-hidden="true" />
          )}
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
        <AuthButton onClick={close} className="mt-6 flex w-full" />
      </div>
    </header>
  )
}

export default Navbar
