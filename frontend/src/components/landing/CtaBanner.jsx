import { Link } from 'react-router'

import mountain from '../../assets/splashart/image_c427a9ec5f1e5eb7dd584a3575773ba6.png'
import character from '../../assets/splashart/miya_revamped_transparent_png_by_kujodave_di1ek9b-pre.png'

const HEADING = ['JOIN NOW & START', 'YOUR CLIMB TODAY!']

const BODY =
  'Stuck at the same rank? Join hundreds of MLBB players breaking plateaus with 1:1 coaching, live gameplay reviews, and ongoing support to reach your peak rank.'

const ArrowIcon = () => (
  <svg viewBox="0 0 8 12" className="h-3 w-2 fill-current" aria-hidden="true">
    <path d="M0 0l8 6-8 6z" />
  </svg>
)

const CtaBanner = () => {
  return (
    <div className="mx-auto max-w-[1650px] px-6 pb-20 lg:px-8 lg:pb-28">
      <div className="relative flex min-h-[380px] items-center sm:min-h-[420px]">
        
        {/* Background Layer (overflow-hidden clips the white wedge to the banner shape) */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-royal-500 shadow-xl">
          <div aria-hidden="true" className="absolute inset-0">
            <img
              src={mountain}
              alt=""
              width={1500}
              height={753}
              className="h-full w-full object-cover opacity-85 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-royal-500 via-royal-500/75 to-royal-500/10" />
          </div>

          {/* Narrower white angled wedge on the right */}
          <div
            aria-hidden="true"
            className="absolute inset-y-0 right-0 w-[38%] bg-white sm:w-[35%] lg:w-[32%] xl:w-[30%] [clip-path:polygon(35%_0,100%_0,100%_100%,0_100%)]"
          />
        </div>

        {/* Text Content Layer */}
        <div className="relative z-10 w-full max-w-[38rem] px-7 py-11 [text-shadow:0_2px_10px_rgba(5,13,36,0.55)] sm:px-10 sm:py-12 lg:max-w-[34rem] lg:px-14 lg:py-14 xl:max-w-[38rem] 2xl:max-w-[42rem]">
          <h2 className="font-display text-3xl font-bold uppercase leading-[1.08] text-white sm:text-4xl lg:text-[2.9rem] xl:text-5xl">
            {HEADING.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">{BODY}</p>

          <Link
            to="/coaches"
            className="mt-9 inline-flex items-center justify-center gap-4 bg-navy-950 px-7 py-[17px] font-display text-base font-semibold uppercase leading-none tracking-wide text-white transition-colors hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-glow sm:px-8 sm:text-[17px]"
          >
            Find your coach now
            <ArrowIcon />
          </Link>
        </div>

        {/* Character Image Layer: Positions Miya over the narrower wedge & lets bow pop out */}
        <img
          src={character}
          alt=""
          width={1049}
          height={761}
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-6 right-[-10%] z-20 h-[115%] w-auto max-w-none select-none sm:-bottom-8 sm:right-[-8%] sm:h-[125%] lg:-bottom-10 lg:right-[2%] lg:h-[130%] xl:right-[-12%] xl:h-[135%]"
        />
      </div>
    </div>
  )
}

export default CtaBanner