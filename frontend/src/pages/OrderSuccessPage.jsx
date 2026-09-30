import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { getOrder } from '../api/orders'
import { laneLabel } from '../data/coaches'
import { formatIDR, formatSession } from '../utils/format'

const OrderSuccessPage = () => {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getOrder(orderId).then(setOrder).catch((e) => setError(e.message))
  }, [orderId])

  if (error) return <p className="py-24 text-center text-red-300">{error}</p>
  if (!order) return <p className="py-24 text-center text-white/60">Loading…</p>

  return (
    <div className="mx-auto max-w-[720px] px-6 py-12 lg:py-16">
      <div className="text-center">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.26em] text-cyan-glow">Payment successful</p>
        <h1 className="mt-3 font-display text-3xl font-bold uppercase text-white sm:text-4xl">You&apos;re booked!</h1>
        <p className="mt-3 text-sm text-white/60">
          {order.coach.name} · {laneLabel(order.lane)} · {formatIDR(order.totalPrice)}
        </p>
        <p className="mt-1 text-xs text-white/40">Order {order.id}</p>
      </div>

      <section className="mt-10 border border-white/10 bg-navy-900">
        <h2 className="border-b border-white/10 px-6 py-4 font-display text-lg font-bold uppercase text-white">
          Your scheduled sessions
        </h2>
        {order.sessions.map((s, i) => {
          const { date, time } = formatSession(s.scheduledAt)
          return (
            <div key={s.id} className={`flex flex-wrap items-center justify-between gap-3 px-6 py-4 ${i < order.sessions.length - 1 ? 'border-b border-white/10' : ''}`}>
              <div>
                <p className="font-semibold text-white">Session {s.sessionNumber} of {s.totalSessions}</p>
                <p className="text-sm text-white/70">{date} · {time}</p>
              </div>
              <span className={`text-sm font-semibold ${s.meetingLink ? 'text-cyan-glow' : 'text-gold-400'}`}>
                {s.meetingLink ? 'Link ready' : 'Meeting link pending'}
              </span>
            </div>
          )
        })}
      </section>

      <p className="mt-4 text-center text-xs text-white/50">
        Your coach will add the meeting link before each session. They may also adjust the time and you&apos;ll be notified.
      </p>

      <div className="mt-8 text-center">
        <Link to="/coaches" className="inline-flex bg-royal-500 px-8 py-4 font-display text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-royal-600">
          Browse more coaches
        </Link>
      </div>
    </div>
  )
}

export default OrderSuccessPage
