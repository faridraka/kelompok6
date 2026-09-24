import { Link } from 'react-router'

import Logo from './Logo'

const FOOTER_GROUPS = [
  {
    title: 'Explore',
    links: [
      { label: 'Find your coach', to: '/coaches' },
      { label: 'Choose your role', href: '/#choose-your-role' },
      { label: 'How it works', href: '/#how-it-works' },
    ],
  },
  {
    title: 'Players',
    links: [
      { label: 'Register', to: '/register' },
      { label: 'Coach packages', to: '/coaches' },
      { label: 'Live sessions', href: '/#how-it-works' },
    ],
  },
  {
    title: 'MetaGames',
    links: [
      { label: 'Verified coaches', to: '/coaches' },
      { label: 'Role coaching', href: '/#choose-your-role' },
      { label: 'Secure payment', to: '/register' },
    ],
  },
]

const FooterLink = ({ link }) =>
  link.to ? (
    <Link
      to={link.to}
      className="text-sm text-white/70 transition-colors hover:text-cyan-glow focus-visible:text-cyan-glow focus-visible:outline-none"
    >
      {link.label}
    </Link>
  ) : (
    <a
      href={link.href}
      className="text-sm text-white/70 transition-colors hover:text-cyan-glow focus-visible:text-cyan-glow focus-visible:outline-none"
    >
      {link.label}
    </a>
  )

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-navy-950">
      <div className="mx-auto max-w-[1650px] px-6 py-12 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_2fr] lg:gap-16">
          <div>
            <Link to="/" aria-label="MetaGames home" className="inline-flex">
              <Logo className="h-12 w-auto lg:h-14" />
            </Link>

            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/70 sm:text-base">
              One-on-one Mobile Legends coaching for players who want sharper reviews, better macro,
              and a clearer climb path.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {FOOTER_GROUPS.map((group) => (
              <div key={group.title}>
                <h2 className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-gold-400">
                  {group.title}
                </h2>
                <ul className="mt-5 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <FooterLink link={link} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright 2026 MetaGames. All rights reserved.</p>
          <p className="font-display uppercase tracking-[0.2em] text-gold-400">
            Climb smarter. Queue stronger.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
