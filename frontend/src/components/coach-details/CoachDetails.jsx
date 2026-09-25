import { Link } from 'react-router'

import { DEFAULT_COACHING_PACKAGE, getCoach } from './coachData'

const ArrowIcon = () => (
  <svg viewBox="0 0 8 12" className="h-3 w-2 fill-current" aria-hidden="true">
    <path d="M0 0l8 6-8 6z" />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0 text-cyan-glow" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="m3 8 3 3 7-7" />
  </svg>
)

const CoachNotFound = () => (
  <section className="bg-navy-950 px-6 py-24 lg:px-8 lg:py-32">
    <div className="mx-auto max-w-xl border border-white/10 bg-navy-900 p-8 text-center sm:p-12">
      <p className="font-display text-xs font-medium uppercase tracking-[0.26em] text-gold-400">Coach not found</p>
      <h1 className="mt-4 font-display text-4xl font-bold uppercase text-white">This coach is off the map</h1>
      <p className="mt-4 text-sm leading-relaxed text-white/70">Choose another role to find a coach who fits the way you play.</p>
      <Link to="/#choose-your-role" className="mt-8 inline-flex items-center gap-3 bg-royal-500 px-5 py-4 font-display text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-royal-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-glow">
        Browse roles
        <ArrowIcon />
      </Link>
    </div>
  </section>
)

const CoachDetails = ({ coachId }) => {
  const coach = getCoach(coachId)

  if (!coach) return <CoachNotFound />

  const checkoutPath = `/checkout?coach=${coach.id}&package=${DEFAULT_COACHING_PACKAGE.id}&sessions=${DEFAULT_COACHING_PACKAGE.sessionCount}`

  return (
    <section className="relative isolate overflow-hidden bg-navy-950">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-80 bg-royal-700/30" />
      <div aria-hidden="true" className="absolute left-1/2 top-20 h-px w-[90vw] -translate-x-1/2 bg-cyan-glow/20" />

      <div className="relative mx-auto max-w-[1320px] px-6 py-12 lg:px-8 lg:py-20">
        <Link to="/coaches" className="inline-flex items-center gap-3 font-display text-xs font-semibold uppercase tracking-wide text-periwinkle-300 transition-colors hover:text-cyan-glow focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-glow">
          <span className="text-lg leading-none">&#8592;</span>
          Back
        </Link>

        <div className="mt-8 grid gap-10 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
          <div>
            <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-end">
              <div className="relative aspect-[4/5] overflow-hidden border border-white/10 bg-navy-900 shadow-2xl">
                <img src={coach.image} alt="" aria-hidden="true" className="h-full w-full object-cover object-top" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950 via-navy-950/35 to-transparent p-5 pt-16">
                  <p className="font-display text-sm font-semibold uppercase tracking-wide text-gold-300">{coach.rank}</p>
                </div>
              </div>

              <div className="pb-2">
                <p className="font-display text-xs font-medium uppercase tracking-[0.26em] text-gold-400">Verified MetaGames coach</p>
                <h1 className="mt-4 font-display text-4xl font-bold uppercase leading-none text-white sm:text-5xl">{coach.name}</h1>
                <p className="mt-3 font-display text-xl font-semibold uppercase tracking-wide text-cyan-glow">{coach.focusRole}</p>
                <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/75">{coach.description}</p>

                <dl className="mt-8 grid grid-cols-3 divide-x divide-white/10 border-y border-white/10 py-4">
                  <div className="pr-4">
                    <dt className="text-[11px] uppercase tracking-wide text-periwinkle-300">Rating</dt>
                    <dd className="mt-1 font-display text-xl font-semibold text-white">{coach.rating}<span className="ml-1 text-sm text-gold-400">/ 5</span></dd>
                  </div>
                  <div className="px-4">
                    <dt className="text-[11px] uppercase tracking-wide text-periwinkle-300">Reviews</dt>
                    <dd className="mt-1 font-display text-xl font-semibold text-white">{coach.reviewCount}</dd>
                  </div>
                  <div className="pl-4">
                    <dt className="text-[11px] uppercase tracking-wide text-periwinkle-300">Sessions coached</dt>
                    <dd className="mt-1 font-display text-xl font-semibold text-white">{coach.sessionCount}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="mt-12 border-t border-white/10 pt-10">
              <p className="font-display text-xs font-medium uppercase tracking-[0.26em] text-gold-400">What you will improve</p>
              <div className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {coach.specialties.map((specialty) => (
                  <div key={specialty} className="flex items-center gap-3 text-sm text-white/80">
                    <CheckIcon />
                    {specialty}
                  </div>
                ))}
              </div>

              <div className="mt-10 grid gap-5 border-t border-white/10 pt-8 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-periwinkle-300">Languages</p>
                  <p className="mt-2 text-sm text-white">{coach.languages.join(' and ')}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-periwinkle-300">Coach response</p>
                  <p className="mt-2 text-sm text-white">{coach.responseTime}</p>
                </div>
              </div>
            </div>
          </div>

          <aside className="border border-white/10 bg-navy-900/95 p-6 shadow-2xl sm:p-7 xl:sticky xl:top-28">
            <p className="font-display text-xs font-medium uppercase tracking-[0.26em] text-gold-400">Coaching package</p>
            <h2 className="mt-3 font-display text-2xl font-bold uppercase text-white">{DEFAULT_COACHING_PACKAGE.sessionCount} live sessions included</h2>

            <div className="mt-6 border border-cyan-glow/50 bg-royal-700/30 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-base font-semibold uppercase tracking-wide text-white">{DEFAULT_COACHING_PACKAGE.name}</p>
                  <p className="mt-1 text-xs text-periwinkle-300">{DEFAULT_COACHING_PACKAGE.sessionDuration} · {DEFAULT_COACHING_PACKAGE.pricePerSession} per session</p>
                </div>
                <p className="shrink-0 font-display text-lg font-semibold text-gold-300">{DEFAULT_COACHING_PACKAGE.totalPrice}</p>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-white/65">{DEFAULT_COACHING_PACKAGE.detail}</p>
            </div>

            <div className="mt-6 flex items-end justify-between border-t border-white/10 pt-5">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-periwinkle-300">Default package</p>
                <p className="mt-1 text-sm text-white">{DEFAULT_COACHING_PACKAGE.sessionCount} live sessions · {DEFAULT_COACHING_PACKAGE.sessionDuration}</p>
              </div>
              <p className="font-display text-2xl font-bold text-gold-300">{DEFAULT_COACHING_PACKAGE.totalPrice}</p>
            </div>

            <Link to={checkoutPath} className="mt-6 inline-flex w-full items-center justify-center gap-3 bg-royal-500 px-5 py-4 font-display text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-royal-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-glow">
              Checkout
              <ArrowIcon />
            </Link>
            <p className="mt-4 text-center text-xs leading-relaxed text-white/50">All {DEFAULT_COACHING_PACKAGE.sessionCount} sessions are scheduled during checkout.</p>
          </aside>
        </div>
      </div>
    </section>
  )
}

export default CoachDetails
