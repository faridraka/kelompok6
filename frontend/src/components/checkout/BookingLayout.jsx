import { Link } from 'react-router'

export const PageShell = ({ title, back, children }) => (
  <div className="mx-auto max-w-[1100px] px-6 py-12 lg:py-16">
    {back}
    <h1 className="mt-2 font-display text-3xl font-bold uppercase text-white sm:text-4xl">{title}</h1>
    <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">{children}</div>
  </div>
)

export const BookingGate = ({ status }) =>
  status === 'loading' ? (
    <p className="py-24 text-center text-white/60">Loading…</p>
  ) : (
    <div className="py-24 text-center">
      <p className="text-white/70">We couldn&apos;t find that booking.</p>
      <Link to="/coaches" className="mt-4 inline-block text-periwinkle-300 hover:text-white">Back to coaches</Link>
    </div>
  )
