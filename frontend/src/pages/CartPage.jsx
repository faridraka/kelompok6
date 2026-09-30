import { Link, useNavigate } from 'react-router'
import OrderSummary, { PrimaryButton } from '../components/checkout/OrderSummary'
import { useBooking } from '../hooks/useBooking'
import { laneLabel } from '../data/coaches'
import { formatIDR } from '../utils/format'
import { calcTotals } from '../utils/pricing'

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

const CartPage = () => {
  const navigate = useNavigate()
  const { status, coach, lane, setLane, coachId } = useBooking()
  if (status !== 'ready') return <BookingGate status={status} />
  const totals = calcTotals(coach.price)
  const multi = coach.lanes.length > 1

  return (
    <PageShell title="Your cart">
      <section className="border border-white/10 bg-navy-900 p-6">
        <div className="flex gap-5">
          <div className="h-24 w-24 shrink-0 overflow-hidden border border-white/15 bg-navy-950">
            {coach.avatar && <img src={coach.avatar} alt="" className="h-full w-full object-cover" />}
          </div>
          <div>
            <span className="bg-white/15 px-3 py-1 font-display text-[11px] font-semibold uppercase tracking-wide text-white">
              3-session package
            </span>
            <h2 className="mt-2 font-display text-xl font-bold uppercase text-white">
              {coach.name}{lane && ` · ${laneLabel(lane)}`}
            </h2>
            <p className="mt-1 text-sm text-white/70">Live 1-on-1 gameplay review with a verified coach.</p>
          </div>
        </div>

        <ul className="mt-6 list-disc space-y-1.5 pl-9 text-sm text-white/75">
          <li>3 live one-on-one sessions</li>
          <li>Sessions are scheduled automatically after payment</li>
          <li>Every session is recorded so you can rewatch the VOD</li>
        </ul>

        <div className="mt-6 border-t border-white/10 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
            {multi ? 'Choose your lane' : 'Lane'}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2" role={multi ? 'radiogroup' : undefined} aria-label="Choose lane">
              {coach.lanes.map((l) => (
                <button
                  key={l}
                  type="button"
                  role={multi ? 'radio' : undefined}
                  aria-checked={multi ? lane === l : undefined}
                  disabled={!multi}
                  onClick={() => setLane(l)}
                  className={`rounded-full px-4 py-2 font-display text-xs font-semibold uppercase tracking-wide transition-colors ${
                    lane === l ? 'bg-white text-navy-950' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {laneLabel(l)}
                </button>
              ))}
            </div>
            <p className="font-display text-xl font-bold text-white">{formatIDR(coach.price)}</p>
          </div>
          {multi && !lane && <p className="mt-3 text-xs text-gold-400">Pick one lane to continue.</p>}
        </div>
      </section>

      <OrderSummary coach={coach} lane={lane} totals={totals}>
        <PrimaryButton type="button" disabled={!lane} onClick={() => navigate(`/checkout?coach=${coachId}&lane=${lane}`)}>Proceed to checkout</PrimaryButton>
      </OrderSummary>
    </PageShell>
  )
}

export default CartPage
