import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { getOrder } from '../api/orders'
import { laneLabel } from '../data/coaches'
import { formatIDR } from '../utils/format'

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

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/player/sessions" className="inline-flex bg-royal-500 px-8 py-4 font-display text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-royal-600">
          View my sessions
        </Link>
        <Link to="/coaches" className="inline-flex border border-white/20 px-8 py-4 font-display text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:border-white/40">
          Browse more coaches
        </Link>
      </div>
    </div>
  )
}

export default OrderSuccessPage
