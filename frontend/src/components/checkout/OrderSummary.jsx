import { laneLabel } from '../../data/coaches'
import { formatIDR } from '../../utils/format'
import { TAX_RATE } from '../../utils/pricing'
import { FiLock } from 'react-icons/fi'

const Row = ({ label, value, strong }) => (
  <div className={`flex justify-between gap-4 text-sm ${strong ? 'font-semibold text-white' : 'text-white/70'}`}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
)

const OrderSummary = ({ coach, lane, totals, children }) => (
  <aside className="h-fit">
    <div className="border border-white/10 bg-navy-900 p-6">
      <h2 className="font-display text-2xl font-bold uppercase text-white">Order summary</h2>

      <div className="mt-5 flex justify-between gap-4">
        <div>
          <p className="text-white">{coach.name}</p>
          <p className="text-sm text-white/50">{lane ? laneLabel(lane) : 'Select a lane'} · 3-session package</p>
        </div>
        <p className="text-sm text-white/70">{formatIDR(totals.subtotal)}</p>
      </div>

      <div className="mt-5 flex flex-col gap-2 border-t border-white/10 pt-5">
        <Row strong label="Subtotal (1 item)" value={formatIDR(totals.subtotal)} />
        <Row label={`Tax (${Math.round(TAX_RATE * 100)}%)`} value={formatIDR(totals.tax)} />
      </div>

      <div className="mt-5 flex items-baseline justify-between border-t border-white/10 pt-5">
        <span className="font-display text-xl uppercase text-white">Total</span>
        <span className="font-display text-3xl font-bold text-gold-400">{formatIDR(totals.total)}</span>
      </div>

      <div className="mt-6">{children}</div>
    </div>

    <p className="mt-4 flex items-center justify-center gap-2 text-sm text-white/50">
      <FiLock className="h-4 w-4" aria-hidden="true" /> Secure Checkout
    </p>
  </aside>
)

export const PrimaryButton = ({ children, ...props }) => (
  <button
    {...props}
    className="flex w-full items-center justify-center gap-3 bg-royal-500 px-6 py-4 font-display text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-royal-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-glow disabled:cursor-not-allowed disabled:opacity-50"
  >
    {children}
  </button>
)

export default OrderSummary
