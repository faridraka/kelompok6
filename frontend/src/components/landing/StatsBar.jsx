const STATS = [
  { value: '1,000+', label: 'players coached' },
  { value: '50+', label: 'verified coaches' },
  { value: '3', label: 'live sessions per package' },
  { value: '4.9/5', label: 'average coach rating' },
]

const StatsBar = () => {
  return (
    <section aria-label="MetaGames in numbers" className="bg-royal-600">
      <dl className="mx-auto grid max-w-5xl grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="relative flex flex-col-reverse items-center gap-1 px-4 py-7 text-center max-lg:odd:before:hidden before:absolute before:left-0 before:top-1/2 before:h-[5.5rem] before:w-px before:-translate-y-1/2 before:bg-linear-to-b before:from-transparent before:via-cyan-glow/70 before:to-transparent"
          >
            <dt className="text-base text-white">{stat.label}</dt>
            <dd className="font-display text-5xl font-bold leading-none text-white lg:text-6xl">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export default StatsBar
