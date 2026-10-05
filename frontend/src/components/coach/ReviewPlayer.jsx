import { useState } from 'react'
import { saveCoachReview } from '../../api/coach'
import { laneLabel } from '../../data/coaches'
import { Empty, btn, card, input } from './ui'

const toList = (text) => text.split(',').map((x) => x.trim()).filter(Boolean) // "a, b" -> ['a', 'b']
const label = 'block text-xs text-white/60'

// One form for both cases: writing a new review, and editing it while the player has not rated yet.
const ReviewForm = ({ order, onSaved }) => {
  const r = order.performanceReview
  const locked = order.status === 'completed' // the player already rated
  const [f, setF] = useState({ notes: r?.notes ?? '', strengths: r?.strengths.join(', ') ?? '', weaknesses: r?.weaknesses.join(', ') ?? '', recommendation: r?.recommendation ?? '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    const body = { notes: f.notes.trim(), strengths: toList(f.strengths), weaknesses: toList(f.weaknesses), recommendation: f.recommendation.trim() }
    if (!body.notes || !body.strengths.length || !body.weaknesses.length || !body.recommendation) return setError('Fill in every field.')
    setBusy(true); setError('')
    try { await saveCoachReview(order.id, body); await onSaved() }
    catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-4 border-t border-white/10 px-5 py-5">
      <label className={label}>Notes
        <textarea rows={3} value={f.notes} onChange={set('notes')} disabled={locked} className={`${input} mt-1 resize-y`} />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className={label}>Strengths (separate with commas)
          <input type="text" value={f.strengths} onChange={set('strengths')} disabled={locked} className={`${input} mt-1`} />
        </label>
        <label className={label}>Weaknesses (separate with commas)
          <input type="text" value={f.weaknesses} onChange={set('weaknesses')} disabled={locked} className={`${input} mt-1`} />
        </label>
      </div>
      <label className={label}>Recommendation
        <textarea rows={2} value={f.recommendation} onChange={set('recommendation')} disabled={locked} className={`${input} mt-1 resize-y`} />
      </label>
      {error && <p className="text-xs text-gold-400">{error}</p>}
      {locked
        ? <p className="text-xs text-white/60">Locked, player has already rated</p>
        : <button type="submit" disabled={busy} className={btn}>{r ? 'Save changes' : 'Submit review'}</button>}
    </form>
  )
}

const statusOf = (o) => (!o.performanceReview ? ['Review needed', 'text-gold-400'] : o.status === 'completed' ? ['Completed', 'text-cyan-glow'] : ['Awaiting rating', 'text-white/60'])

// Section "Review Player": finished orders, one open at a time. `openId` is shared with the dashboard cards.
const ReviewPlayer = ({ orders, sessions, openId, onOpen, onSaved }) => {
  const done = (o) => sessions.filter((s) => s.orderId === o.id).every((s) => s.status === 'completed')
  const last = (o) => sessions.filter((s) => s.orderId === o.id).map((s) => s.scheduledAt).sort().pop()
  // Reviews to write first, then the rest, newest first.
  const list = orders.filter(done).sort((a, b) => (!b.performanceReview - !a.performanceReview) || (last(b) ?? '').localeCompare(last(a) ?? ''))

  return (
    <section id="reviews" className="scroll-mt-24">
      <h2 className="mb-3 font-display text-xl font-bold uppercase text-white">Review Player</h2>
      {list.length ? (
        <div className="space-y-3">
          {list.map((o) => {
            const open = openId === o.id
            const [text, color] = statusOf(o)
            return (
              <div key={o.id} className={card}>
                <button type="button" onClick={() => onOpen(open ? null : o.id)} aria-expanded={open}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white/5">
                  <span>
                    <span className="block text-sm font-semibold text-white">{o.player.name}</span>
                    <span className="block text-xs text-white/60">{o.id.toUpperCase()} · {laneLabel(o.lane)}</span>
                  </span>
                  <span className="flex items-center gap-4 text-sm">
                    <span className={`font-semibold ${color}`}>{text}</span>
                    <span className="w-12 text-right text-white/60">{open ? 'Close' : 'Open'}</span>
                  </span>
                </button>
                {open && <ReviewForm order={o} onSaved={onSaved} />}
              </div>
            )
          })}
        </div>
      ) : <Empty>No finished orders to review yet.</Empty>}
    </section>
  )
}
export default ReviewPlayer
