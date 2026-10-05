import { useNavigate } from 'react-router'
import { laneLabel } from '../../data/coaches'
import { formatIDR } from '../../utils/format'
import { FiStar, FiChevronRight } from 'react-icons/fi'

const CoachCard = ({ coach }) => {
  const navigate = useNavigate()

  const stats = [
    { label: 'Peak Rank', value: coach.peakRank },
    { label: 'VODs coached', value: coach.vodsCoached },
    { label: 'Main Hero', value: coach.mainHero },
  ]

  // Book -> /cart. The player picks their lane on the cart page.
  const book = () => navigate(`/cart?coach=${coach.id}`)

  return (
    <article className="flex flex-col gap-6 border border-white/10 bg-royal-600 p-6">
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-white/20 bg-navy-950">
          {coach.avatar ? (
            <img src={coach.avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-display text-lg text-white/50">
              {coach.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
            </div>
          )}
        </div>

        <div>
          <p className="font-display text-[11px] font-medium uppercase tracking-[0.22em] text-periwinkle-300">
            {coach.academyLabel}
          </p>
          <h3 className="mt-1 font-display text-xl font-bold uppercase leading-tight text-white">{coach.name}</h3>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {coach.lanes.map((l) => (
              <span key={l} className="rounded-full bg-navy-950/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold-400">
                {laneLabel(l)}
              </span>
            ))}
          </div>
        </div>
      </div>

      <p className="line-clamp-3 min-h-[4.3rem] text-sm leading-relaxed text-white/85">{coach.bio}</p>

      <div className="grid grid-cols-3 divide-x divide-white/15 border-y border-white/15 py-4 text-center">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col gap-1 px-1">
            <span className="flex min-h-[2.75rem] items-center justify-center font-display text-lg font-bold leading-tight text-white sm:text-xl">
              {s.value}
            </span>
            <span className="text-[11px] leading-tight text-white/70">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="flex min-h-[10.5rem] flex-col gap-3 border border-white/15 bg-navy-950/40 p-4">
        <div className="flex gap-0.5">
          {Array.from({ length: coach.rating }).map((_, i) => (
            <FiStar key={i} className="h-3.5 w-3.5 fill-current text-emerald-400" aria-hidden="true" />
          ))}
        </div>
        <p className="line-clamp-3 flex-1 text-sm italic leading-relaxed text-white/90">&ldquo;{coach.testimonial.quote}&rdquo;</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-500 text-[10px] font-bold text-navy-950">
              {coach.testimonial.reviewerInitials}
            </span>
            <span className="text-xs text-white/80">{coach.testimonial.reviewerName}</span>
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">Trustpilot</span>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-4 pt-1">
        <div className="leading-tight">
          <p className="text-xs text-white/60">3-session package</p>
          <p className="font-display text-lg font-bold text-white">
            {formatIDR(coach.price)}
          </p>
        </div>

        <button
          type="button"
          onClick={book}
          className="inline-flex items-center justify-center gap-3 bg-navy-950 px-5 py-3 font-display text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-glow"
        >
          Book package
          <FiChevronRight className="h-3 w-2" aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}

export default CoachCard
