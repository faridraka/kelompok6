import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { finishPayment, getPayment } from '../api/orders'
import { PrimaryButton } from '../components/checkout/OrderSummary'
import { formatIDR } from '../utils/format'
import qrPlaceholder from '../assets/payment/qris-placeholder.png'

const PaymentPage = () => {
  const { paymentId } = useParams()
  const navigate = useNavigate()
  const [payment, setPayment] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // PAY-2: poll until paid (the real Midtrans webhook will flip this later).
  useEffect(() => {
    let stop = false
    const tick = () =>
      getPayment(paymentId)
        .then((p) => {
          if (stop) return
          setPayment(p)
          if (p.status === 'paid') navigate(`/orders/${p.orderId}/success`, { replace: true })
        })
        .catch((e) => !stop && setError(e.message))
    tick()
    const id = setInterval(tick, 3000)
    return () => { stop = true; clearInterval(id) }
  }, [paymentId, navigate])

  // PAY-3: fake "I've paid" button. Remove when Midtrans is wired in.
  const finish = async () => {
    setBusy(true)
    try {
      const p = await finishPayment(paymentId)
      navigate(`/orders/${p.orderId}/success`, { replace: true })
    } catch (e) {
      setError(e.message)
      setBusy(false)
    }
  }

  if (error && !payment) return <p className="py-24 text-center text-red-300">{error}</p>
  if (!payment) return <p className="py-24 text-center text-white/60">Loading…</p>

  return (
    <div className="mx-auto max-w-[460px] px-6 py-12 lg:py-16">
      <div className="border border-white/10 bg-navy-900 p-8 text-center">
        <p className="font-display text-[11px] font-semibold uppercase tracking-[0.26em] text-gold-400">Pay with QRIS</p>
        <p className="mt-3 font-display text-4xl font-bold text-white">{formatIDR(payment.amount)}</p>
        <p className="mt-1 text-sm text-white/60">Scan the code with any QRIS-enabled app</p>

        {/* NEXT WEEK: render payment.qrPayload here (e.g. a QR lib, or an <img src> if the API returns an image URL). */}
        <div className="mx-auto mt-6 w-64 bg-white p-3">
          <img src={qrPlaceholder} alt="QRIS placeholder" className="h-full w-full" />
        </div>

        <p className="mt-4 text-xs text-white/40">Demo payment · no real money is charged</p>
        {error && <p className="mt-3 text-xs text-red-300">{error}</p>}
        <div className="mt-6">
          <PrimaryButton type="button" onClick={finish} disabled={busy}>
            {busy ? 'Confirming…' : 'Finish payment'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}

export default PaymentPage
