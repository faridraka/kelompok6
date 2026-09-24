import { useState } from 'react'
import { Link } from 'react-router'

import heroBg from '../../assets/hero/hero-bg.webp'
import heroLeft from '../../assets/hero/hero-left.webp'
import heroRight from '../../assets/hero/hero-right.webp'
// import CharacterTuner from './CharacterTuner'
import HeroCharacter from './HeroCharacter'
import { DEFAULT_LAYOUT, useBreakpoint } from './heroLayout'

// // Live tuning panel: only when running `npm run dev` and the URL has ?tune
// const TUNING = import.meta.env.DEV && new URLSearchParams(window.location.search).has('tune')

const PERKS = [
  'Live 1:1 gameplay review',
  '3 live sessions per package',
  'Secure payment',
]

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 8.5l3.2 3.2L13 4.8" />
  </svg>
)

const Hero = () => {
  const [layout, setLayout] = useState(DEFAULT_LAYOUT)
  const breakpoint = useBreakpoint()

  return (
    <section className="relative isolate overflow-hidden bg-navy-950 lg:flex lg:min-h-[640px] lg:items-center xl:min-h-[700px] 2xl:min-h-[800px]">
      {/* Background: MLBB-style blue sky, with the map showing through as detail */}
      <div aria-hidden="true" className="absolute inset-0 -z-20">
        <div className="absolute inset-0 bg-linear-to-b from-navy-950 via-[#0f2b5c] to-[#081a3a]" />
        <img
          src={heroBg}
          alt=""
          width={1276}
          height={704}
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-90 mix-blend-soft-light grayscale contrast-150 brightness-75"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_50%_at_50%_42%,rgba(70,120,190,0.22),transparent_72%)]" />
        {/* Darkens the text column specifically, so the headline and body stay readable over the map */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_65%_at_50%_45%,rgba(3,10,28,0.62),transparent_75%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,var(--color-navy-950)_120%)]" />
      </div>

      <HeroCharacter src={heroLeft} width={662} height={642} side="left" {...layout.left[breakpoint]} />
      <HeroCharacter src={heroRight} width={1004} height={705} side="right" {...layout.right[breakpoint]} />

      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-6 pb-[68vw] pt-14 text-center sm:pb-[46vw] lg:py-20">
        <p className="text-balance font-display text-xs font-medium uppercase tracking-[0.22em] text-gold-400 sm:text-[13px] sm:tracking-[0.26em]">
          One-on-one Mobile Legends: Bang Bang coaching
        </p>

        <h1 className="mt-4 font-display text-3xl font-bold uppercase leading-[1.1] text-white sm:text-4xl md:text-[2.25rem] lg:text-[2.5rem] xl:text-5xl 2xl:text-[3.25rem]">
          <span className="md:block">Tired of toxic solo queue </span>
          <span className="md:block">teammates and coin-flip matches?</span>
        </h1>

        <p className="mt-6 max-w-2xl text-pretty lg:max-w-xl xl:max-w-2xl text-lg leading-relaxed text-white sm:text-xl 2xl:max-w-[52rem]">
          Work directly with verified Mythical Immortal coaches who review your live gameplay, fix
          your macro blind spots, and teach you how to solo carry in any rank.
        </p>

        <Link
          to="/coaches"
          className="mt-8 inline-flex items-center justify-center gap-4 bg-royal-500 px-8 py-[18px] font-display text-[17px] font-semibold uppercase leading-none tracking-wide text-white transition-colors hover:bg-royal-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-glow"
        >
          Find your coach
          <svg viewBox="0 0 8 12" className="h-3 w-2 fill-current" aria-hidden="true">
            <path d="M0 0l8 6-8 6z" />
          </svg>
        </Link>

        <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-base text-white sm:text-[17px]">
          {PERKS.map((perk) => (
            <li key={perk} className="flex items-center gap-2">
              <CheckIcon />
              {perk}
            </li>
          ))}
        </ul>
      </div>

      {/* {TUNING && <CharacterTuner layout={layout} setLayout={setLayout} breakpoint={breakpoint} />} */}
    </section>
  )
}

export default Hero
