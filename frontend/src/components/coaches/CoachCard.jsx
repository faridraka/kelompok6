    import { LANES } from '../../data/coaches'

    const StarIcon = () => (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current text-emerald-400" aria-hidden="true">
        <path d="M8 0l2.47 5.01 5.53.8-4 3.9.94 5.51L8 12.6l-4.94 2.62.94-5.51-4-3.9 5.53-.8z" />
    </svg>
    )

    const ArrowIcon = () => (
    <svg viewBox="0 0 8 12" className="h-3 w-2 fill-current" aria-hidden="true">
        <path d="M0 0l8 6-8 6z" />
    </svg>
    )

    const laneLabel = (key) => LANES.find((l) => l.key === key)?.label ?? key

    const CoachCard = ({ coach }) => {
    const stats = [
        { label: 'Peak Rank', value: coach.peakRank },
        { label: 'VODs coached', value: coach.vodsCoached },
        { label: 'Main Hero', value: coach.mainHero },
    ]

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
            <h3 className="mt-1 font-display text-xl font-bold uppercase leading-tight text-white">
                {coach.name}
            </h3>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
                {coach.lanes.map((lane) => (
                <span
                    key={lane}
                    className="rounded-full bg-navy-950/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold-400"
                >
                    {laneLabel(lane)}
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
                <StarIcon key={i} />
            ))}
            </div>
            <p className="line-clamp-3 flex-1 text-sm italic leading-relaxed text-white/90">
            &ldquo;{coach.testimonial.quote}&rdquo;
            </p>
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
                {coach.price}{' '}
                <span className="text-sm font-normal text-white/50 line-through">{coach.originalPrice}</span>
            </p>
            </div>

            <button
            type="button"
            className="inline-flex items-center justify-center gap-3 bg-navy-950 px-5 py-3 font-display text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-glow"
            >
            Book package
            <ArrowIcon />
            </button>
        </div>
        </article>
    )
    }

    export default CoachCard