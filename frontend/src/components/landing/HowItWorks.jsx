import gameplay from '../../assets/howitworks/gameplay.webp'

const EYEBROW = 'How it works'

const HEADING_PARTS = [
  'GET YOUR ',
  ['GAMEPLAY REVIEWED LIVE 1-ON-1'],
  ', LEARN THE EXACT MISTAKES KEEPING YOU STUCK, AND GET A CLEAR ACTION PLAN',
]

const FEATURES = [
  {
    key: 'vod',
    heading: 'Watch the VOD anytime',
    description:
      'Every live session is recorded, so you can rewatch the review and jump back to specific moments whenever you want.',
  },
  {
    key: 'schedule',
    heading: 'Book a time that works for you',
    description:
      'Pick from live sessions scheduled across time zones and book the one that actually fits your day.',
  },
  {
    key: 'message',
    heading: 'Message your coach between sessions',
    description:
      'Ask a quick question about a match, a hero pick, or your mindset without waiting for your next session.',
  },
]

const HowItWorks = () => {
  return (
    <div id="how-it-works" className="mx-auto max-w-[1650px] px-6 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-4xl text-center">
        <p className="font-display text-xs font-medium uppercase tracking-[0.26em] text-gold-400 sm:text-sm">
          {EYEBROW}
        </p>
        <h2 className="mt-4 font-display text-3xl font-bold uppercase leading-tight text-white sm:text-4xl lg:text-[2.75rem]">
          {HEADING_PARTS.map((part, i) =>
            Array.isArray(part) ? (
              <span key={i} className="underline decoration-2 underline-offset-4">
                {part[0]}
              </span>
            ) : (
              <span key={i}>{part}</span>
            ),
          )}
        </h2>
      </div>

      <div className="mx-auto mt-12 max-w-5xl overflow-hidden border border-white/15">
        <img src={gameplay} alt="" width={2392} height={1080} className="h-full w-full object-cover" />
      </div>

      <div className="mx-auto mt-20 grid max-w-5xl grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
        {FEATURES.map((feature, i) => (
          <div
            key={feature.key}
            className={`flex flex-col gap-2 ${i > 0 ? 'sm:border-l sm:border-white/15 sm:pl-8' : ''}`}
          >
            <h3 className="font-display text-lg font-bold uppercase leading-snug text-white">{feature.heading}</h3>
            <p className="text-sm leading-relaxed text-white/75">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HowItWorks
