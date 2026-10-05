import { useEffect, useState } from 'react'

// The coach side is ONE page. Each id below is a <section id="..."> on /coach/dashboard.
export const SECTIONS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'records', label: 'Upload Record' },
  { id: 'reviews', label: 'Review Player' },
  { id: 'profile', label: 'Profile' },
]

// Smooth scroll. Sections carry `scroll-mt-24` so the sticky nav does not cover their heading.
export const goTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

// The id of the section being read: the last one whose top has passed under the nav.
// Sections render after the data loads, so we look them up on every scroll instead of observing once.
export const useActiveSection = () => {
  const [active, setActive] = useState(SECTIONS[0].id)
  useEffect(() => {
    const update = () => {
      const found = SECTIONS.filter(({ id }) => document.getElementById(id))
      const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 2
      const passed = found.filter(({ id }) => document.getElementById(id).getBoundingClientRect().top <= 120)
      const current = atBottom && window.scrollY > 0 ? found[found.length - 1] : passed[passed.length - 1]
      setActive(current ? current.id : SECTIONS[0].id)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
  }, [])
  return active
}
