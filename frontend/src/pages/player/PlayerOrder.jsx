import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { getOrder, postRating } from '../../api/player'
import { laneLabel } from '../../data/coaches'
import { useAsync } from '../../hooks/useAsync'
import { Async, PageHeader, btn } from '../../components/player/ui'

// Test route: /player/orders/ord-002 (awaiting rating) or /player/orders/ord-001 (still in progress).
const PlayerOrder = () => {
  const { id } = useParams()
  const state = useAsync(() => getOrder(id), [id])
  const [stars, setStars] = useState(0)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!stars) return
    setBusy(true)
    await postRating(id, { rating: stars, review: text })
    setBusy(false)
    state.reload()
  }

  return (
    <Async state={state}>
      {(o) => {
        const done = o.sessions.filter((s) => s.status === 'completed').length
        const r = o.performanceReview
        return (
          <>
            <Link to="/player/sessions" className="mb-4 inline-block text-sm text-periwinkle-300 hover:text-white">‹ Back to sessions</Link>
            <PageHeader title={`${o.coach.name} · ${laneLabel(o.lane)}`} sub={`${done}/${o.totalSessions} sessions completed`} />
            {!r ? <p className="border border-white/10 bg-navy-900/70 backdrop-blur-sm p-6 text-sm text-white/60">Your performance review appears here after all 3 sessions are done.</p> : (
              <div className="max-w-2xl space-y-8">
                <section className="space-y-3 border border-white/10 bg-navy-900/70 backdrop-blur-sm p-6 text-sm text-white/80">
                  <h2 className="font-display text-xl font-bold uppercase text-white">Performance review</h2>
                  <p>{r.notes}</p>
                  <p><span className="font-semibold text-white">Strengths:</span> {r.strengths.join(', ')}</p>
                  <p><span className="font-semibold text-white">Weaknesses:</span> {r.weaknesses.join(', ')}</p>
                  <p><span className="font-semibold text-white">Recommendation:</span> {r.recommendation}</p>
                </section>
                {o.status === 'awaiting_rating' ? (
                  <form onSubmit={submit} className="space-y-4 border border-gold-400/40 bg-navy-900/70 backdrop-blur-sm p-6">
                    <h2 className="font-display text-xl font-bold uppercase text-white">Rate your coach</h2>
                    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} type="button" role="radio" aria-checked={stars === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => setStars(n)}
                          className={`text-3xl ${n <= stars ? 'text-gold-400' : 'text-white/25'}`}>★</button>
                      ))}
                    </div>
                    <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="How was your coaching?" className="w-full border border-white/10 bg-navy-950 p-3 text-sm text-white focus:border-royal-500 focus:outline-none" />
                    <button type="submit" disabled={!stars || busy} className={`${btn} disabled:opacity-50`}>Submit rating</button>
                  </form>
                ) : <p className="text-sm text-cyan-glow">Thanks, your rating was submitted.</p>}
              </div>
            )}
          </>
        )
      }}
    </Async>
  )
}
export default PlayerOrder
