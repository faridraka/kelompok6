import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import OrderSummary, { PrimaryButton } from '../components/checkout/OrderSummary'
import { BookingGate, PageShell } from '../components/checkout/BookingLayout'
import SchedulePicker, { SCHEDULE_COUNT } from '../components/checkout/SchedulePicker'
import { useBooking } from '../hooks/useBooking'
import { createOrder, createPayment } from '../api/orders'
import { getStoredUser } from '../utils/session'
import { laneLabel } from '../data/coaches'
import { formatIDR } from '../utils/format'
import { calcTotals } from '../utils/pricing'

const REQUIRED = 'This field is required'

const Card = ({ title, children }) => (
  <section className="border border-white/10 bg-navy-900 p-6">
    <h2 className="font-display text-xl font-bold uppercase text-white">{title}</h2>
    <div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div>
  </section>
)

const Field = ({ label, name, form, errors, onChange, full, children, ...rest }) => (
  <div className={`flex flex-col gap-1.5 ${full ? 'sm:col-span-2' : ''}`}>
    <label htmlFor={name} className="text-xs font-semibold uppercase tracking-wide text-white/70">{label}</label>
    {children ?? (
      <input
        id={name} name={name} value={form[name]} onChange={onChange} {...rest}
        className={`w-full border bg-navy-950 px-4 py-3 text-sm text-white focus:outline-none ${errors[name] ? 'border-red-400/70' : 'border-white/10 focus:border-royal-500'}`}
      />
    )}
    {errors[name] && <p className="text-xs text-red-300">{errors[name]}</p>}
  </div>
)

const CheckoutPage = () => {
  const navigate = useNavigate()
  const { status, coach, lane, setLane, session } = useBooking()
  const user = getStoredUser()
  const [first = '', ...rest] = (user?.name || '').split(' ')
  const [form, setForm] = useState({ email: session?.email || '', firstName: first, lastName: rest.join(' ') })
  const [schedules, setSchedules] = useState([])
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  if (status !== 'ready') return <BookingGate status={status} />
  const totals = calcTotals(coach.price)
  const multi = coach.lanes.length > 1
  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setErrors((x) => ({ ...x, [e.target.name]: '', submit: '' }))
  }
  const pickSchedules = (next) => {
    setSchedules(next)
    setErrors((x) => ({ ...x, schedules: '', submit: '' }))
  }

  const pay = async () => {
    const next = {}
    if (!lane) next.lane = 'Pick one lane to continue.'
    if (schedules.length !== SCHEDULE_COUNT) next.schedules = `Pick ${SCHEDULE_COUNT} session times.`
    Object.entries(form).forEach(([k, v]) => { if (!v.trim()) next[k] = REQUIRED })
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address.'
    if (Object.keys(next).length) return setErrors(next)

    setBusy(true)
    try {
      // ORD-1 then PAY-1. Order is 'pending_payment' until PAY-3 on the QRIS screen.
      const order = await createOrder({ coachId: coach.id, lane, billing: form, schedules })
      const payment = await createPayment(order.id)
      navigate(`/payment/${payment.id}`)
    } catch (err) {
      setErrors({ submit: err.message })
      setBusy(false)
    }
  }

  const fp = { form, errors, onChange }
  return (
    <PageShell
      title="Checkout"
      back={<Link to="/coaches" className="text-sm text-periwinkle-300 hover:text-white">‹ Back to coaches</Link>}
    >
      <div className="flex flex-col gap-6">
        <section className="border border-white/10 bg-navy-900 p-6">
          <h2 className="font-display text-xl font-bold uppercase text-white">Your package</h2>
          <div className="mt-5 flex gap-5">
            <div className="h-24 w-24 shrink-0 overflow-hidden border border-white/15 bg-navy-950">
              {coach.avatar && <img src={coach.avatar} alt="" className="h-full w-full object-cover" />}
            </div>
            <div>
              <span className="bg-white/15 px-3 py-1 font-display text-[11px] font-semibold uppercase tracking-wide text-white">
                3-session package
              </span>
              <h3 className="mt-2 font-display text-xl font-bold uppercase text-white">
                {coach.name}{lane && ` · ${laneLabel(lane)}`}
              </h3>
              <p className="mt-1 text-sm text-white/70">Live 1-on-1 gameplay review with a verified coach.</p>
            </div>
          </div>

          <ul className="mt-6 list-disc space-y-1.5 pl-9 text-sm text-white/75">
            <li>3 live one-on-one sessions</li>
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
                    onClick={() => { setLane(l); setErrors((x) => ({ ...x, lane: '', submit: '' })) }}
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
            {errors.lane && <p className="mt-3 text-xs text-gold-400">{errors.lane}</p>}
          </div>
        </section>

        <section className="border border-white/10 bg-navy-900 p-6">
          <h2 className="font-display text-xl font-bold uppercase text-white">Pick your 3 sessions</h2>
          <p className="mt-1 text-sm text-white/60">Times come from {coach.name}&apos;s weekly availability (Jakarta time).</p>
          <div className="mt-5">
            <SchedulePicker availability={coach.availability} value={schedules} onChange={pickSchedules} />
          </div>
          {errors.schedules && <p className="mt-3 text-xs text-gold-400">{errors.schedules}</p>}
        </section>

        <Card title="Account details">
          <Field {...fp} full label="Email" name="email" type="email" autoComplete="email" />
          <Field {...fp} label="First name" name="firstName" autoComplete="given-name" />
          <Field {...fp} label="Last name" name="lastName" autoComplete="family-name" />
        </Card>

        <section className="border border-white/10 bg-navy-900 p-6">
          <h2 className="font-display text-xl font-bold uppercase text-white">Payment method</h2>
          <label className="mt-5 flex items-center gap-3 border border-royal-500 bg-royal-500/15 px-4 py-4">
            <input type="radio" checked readOnly className="accent-royal-500" />
            <span className="font-display text-sm font-semibold uppercase tracking-wide text-white">QRIS</span>
            <span className="ml-auto text-xs text-white/50">Scan with any e-wallet or mobile banking app</span>
          </label>
        </section>
      </div>

      <OrderSummary coach={coach} lane={lane} totals={totals}>
        {errors.submit && <p className="mb-3 text-center text-xs text-red-300">{errors.submit}</p>}
        <PrimaryButton type="button" onClick={pay} disabled={busy}>
          {busy ? 'Processing…' : `Pay ${formatIDR(totals.total)}`}
        </PrimaryButton>
      </OrderSummary>
    </PageShell>
  )
}

export default CheckoutPage
