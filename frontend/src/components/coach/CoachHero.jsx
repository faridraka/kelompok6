import heroBg from '../../assets/hero/hero-bg.webp'
import heroLeft from '../../assets/coach/coach-hero-left.webp'
import heroRight from '../../assets/coach/coach-hero-right.webp'

// Full-width banner: map background, Kagura on the left and Ruby on the right (lg and up, behind the text), centred greeting.
// The page content is narrower than the screen, so the banner pulls itself out to the screen edges and up under the nav.
// The Next session card is drawn over its bottom edge, so the text keeps clear of the last 48px.
const art = 'pointer-events-none absolute -bottom-10 z-0 hidden h-[340px] w-auto max-w-none lg:block xl:h-[400px]'

const CoachHero = ({ coach, avg, status, issues }) => (
  <section className="relative isolate -mt-8 mx-[calc(50%-50vw)] h-[400px] overflow-hidden">
    <img src={heroBg} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
    <div className="absolute inset-0 bg-navy-950/55" />
    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-navy-950 to-transparent" />

    <img src={heroLeft} alt="" aria-hidden="true" className={`${art} -left-[60px]`} />
    <img src={heroRight} alt="" aria-hidden="true" className={`${art} -right-[170px]`} />

    <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 pb-12 text-center">
      <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-periwinkle-300">Coach dashboard</p>
      <p className="mt-3 font-display text-xl font-bold uppercase tracking-wide text-white">Welcome back,</p>
      <h1 className="font-display text-5xl font-bold uppercase leading-none text-white sm:text-6xl lg:text-7xl">{coach.name}</h1>
      <p className="mt-4 text-sm text-white">{coach.academyLabel} · {avg ? `Rated ${avg.toFixed(1)}/5` : 'No ratings yet'}</p>
      <p className={`mt-2 text-sm font-semibold ${issues ? 'text-gold-400' : 'text-white'}`}>{status}</p>
    </div>
  </section>
)
export default CoachHero
