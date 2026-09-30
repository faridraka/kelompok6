import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import OrderSummary, { PrimaryButton } from '../components/checkout/OrderSummary'
import { BookingGate, PageShell } from './CartPage'
import { useBooking } from '../hooks/useBooking'
import { createOrder, createPayment } from '../api/orders'
import { getStoredUser } from '../utils/session'
import { formatIDR } from '../utils/format'
import { calcTotals } from '../utils/pricing'

const COUNTRIES = ['Indonesia', 'Malaysia', 'Singapore', 'Philippines', 'Thailand', 'Other']
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

const DiscordContact = ({ username }) => {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(username)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <section className="border border-white/10 bg-navy-900 p-6">
      <h2 className="font-display text-xl font-bold uppercase text-white">Coach contact</h2>
      <p className="mt-2 text-sm text-white/60">
        Sessions can be rescheduled by you or your coach, so save their Discord username to stay in touch.
      </p>
      <div className="mt-4 flex items-center justify-between gap-4 border border-white/10 bg-navy-950 px-4 py-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">Discord username</p>
          <p className="text-white">{username || 'Not provided yet'}</p>
        </div>
        {username && (
          <button type="button" onClick={copy} className="font-display text-xs font-semibold uppercase tracking-wide text-periwinkle-300 hover:text-white">
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}
      </div>
    </section>
  )
}

const CheckoutPage = () => {
  const navigate = useNavigate()
  const { status, coach, lane, coachId, session } = useBooking()
  const user = getStoredUser()
  const [first = '', ...rest] = (user?.name || '').split(' ')
  const [form, setForm] = useState({ email: session?.email || '', firstName: first, lastName: rest.join(' '), zip: '', state: '', country: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  if (status !== 'ready') return <BookingGate status={status} />
  if (!lane) return <Navigate to={`/cart?coach=${coachId}`} replace />
  const totals = calcTotals(coach.price)
  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setErrors((x) => ({ ...x, [e.target.name]: '', submit: '' }))
  }

  const pay = async () => {
    const next = {}
    Object.entries(form).forEach(([k, v]) => { if (!v.trim()) next[k] = REQUIRED })
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address.'
    if (Object.keys(next).length) return setErrors(next)

    setBusy(true)
    try {
      // ORD-1 then PAY-1. Order is 'pending_payment' until PAY-3 on the QRIS screen.
      const order = await createOrder({ coachId: coach.id, lane, billing: form })
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
      back={<Link to={`/cart?coach=${coachId}&lane=${lane}`} className="text-sm text-periwinkle-300 hover:text-white">‹ Back to cart</Link>}
    >
      <div className="flex flex-col gap-6">
        <Card title="Account details">
          <Field {...fp} full label="Email" name="email" type="email" autoComplete="email" />
          <Field {...fp} label="First name" name="firstName" autoComplete="given-name" />
          <Field {...fp} label="Last name" name="lastName" autoComplete="family-name" />
        </Card>

        <Card title="Billing address">
          <Field {...fp} label="Zip" name="zip" autoComplete="postal-code" />
          <Field {...fp} label="State" name="state" autoComplete="address-level1" />
          <Field {...fp} full label="Country" name="country">
            <select
              id="country" name="country" value={form.country} onChange={onChange}
              className={`w-full border bg-navy-950 px-4 py-3 text-sm text-white focus:outline-none ${errors.country ? 'border-red-400/70' : 'border-white/10 focus:border-royal-500'}`}
            >
              <option value="">Pick a country</option>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </Card>

        <DiscordContact username={coach.discordUsername} />

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
