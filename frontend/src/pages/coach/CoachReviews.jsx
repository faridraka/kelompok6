import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { getCoachOrders, getCoachSessions, saveCoachReview } from '../../api/coach'
import banner from '../../assets/coach/schedule-banner.webp'
import PlayerReviewCard, { LaneArt } from '../../components/coach/PlayerReviewCard'
import { Empty, btn, btnGhost, card, input } from '../../components/coach/ui'
import { Async, PageHeader, Pill } from '../../components/player/ui'
import { laneLabel } from '../../data/coaches'
import { useAsync } from '../../hooks/useAsync'

const FILTERS = [['all', 'All'], ['todo', 'To review'], ['done', 'Reviewed']]
const EMPTY = { all: 'No orders ready for review yet.', todo: 'No reviews to write right now.', done: 'No reviews written yet.' }
const load = async () => {
  const [orders, sessions] = await Promise.all([getCoachOrders(), getCoachSessions()])
  return { orders, sessions }
}
const toList = (text) => text.split(',').map((x) => x.trim()).filter(Boolean) // "a, b" -> ['a', 'b']

const Field = ({ label, hint, error, children }) => (
  <label className="block text-xs text-white/60">
    {label} <span className="text-white/40">({hint})</span>
    {children}
    {error && <span className="mt-1 block text-xs text-gold-400">Required</span>}
  </label>
)

// Full-width panel under the grid. One form for writing, editing, and (locked) reading a review.
// It mounts when a card is opened (key = order id), so it starts fresh and scrolls itself into view once.
const ReviewPanel = ({ order, locked, onDone, onSaved }) => {
  const r = order.performanceReview
  const [f, setF] = useState({ notes: r?.notes ?? '', strengths: r?.strengths.join(', ') ?? '', weaknesses: r?.weaknesses.join(', ') ?? '', recommendation: r?.recommendation ?? '' })
  const [tried, setTried] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const ref = useRef(null)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  useEffect(() => {
    const smooth = !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ref.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' }) // scroll-mt-24 keeps it clear of the sticky nav
  }, [])

  // strengths and weaknesses go out as ARRAYS (the player side calls .join on them).
  const body = { notes: f.notes.trim(), strengths: toList(f.strengths), weaknesses: toList(f.weaknesses), recommendation: f.recommendation.trim() }
  const empty = (k) => tried && !body[k].length // works for strings and arrays

  const save = async (e) => {
    e.preventDefault()
    setTried(true)
    if (Object.keys(body).some((k) => !body[k].length)) return
    setBusy(true); setError('')
    try { await saveCoachReview(order.id, body); await onSaved(); onDone() }
    catch (err) { setError(err.message); setBusy(false) }
  }

  return (
    <section id="review-panel" ref={ref} className={`${card} mt-6 scroll-mt-24`}>
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <LaneArt order={order} className="h-12 w-12 shrink-0 rounded-md border border-white/10 p-1" />
          <div className="min-w-0">
            <h2 className="truncate font-display text-xl font-bold uppercase text-white">{order.player.name}</h2>
            <p className="text-xs text-white/60">{order.id.toUpperCase()} · {laneLabel(order.lane)}</p>
          </div>
        </div>
        <button type="button" onClick={onDone} className={btnGhost}>Close</button>
      </div>
      <form onSubmit={save} className="space-y-4 px-5 py-5">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Notes" hint="short summary, 1-2 sentences" error={empty('notes')}>
              <textarea rows={3} value={f.notes} onChange={set('notes')} disabled={locked} className={`${input} mt-1 resize-y`} />
            </Field>
            <Field label="Recommendation" hint="what to practice next" error={empty('recommendation')}>
              <textarea rows={3} value={f.recommendation} onChange={set('recommendation')} disabled={locked} className={`${input} mt-1 resize-y`} />
            </Field>
          </div>
          <div className="space-y-4">
            <Field label="Strengths" hint="separate with commas" error={empty('strengths')}>
              <input type="text" value={f.strengths} onChange={set('strengths')} disabled={locked} className={`${input} mt-1`} />
            </Field>
            <Field label="Weaknesses" hint="separate with commas" error={empty('weaknesses')}>
              <input type="text" value={f.weaknesses} onChange={set('weaknesses')} disabled={locked} className={`${input} mt-1`} />
            </Field>
          </div>
        </div>
        {error && <p className="text-xs text-gold-400">{error}</p>}
        {locked
          ? <p className="text-xs text-white/60">Locked, player has already rated</p>
          : (
            <div className="flex gap-2">
              <button type="submit" disabled={busy} className={btn}>Save review</button>
              <button type="button" onClick={onDone} disabled={busy} className={btnGhost}>Cancel</button>
            </div>
          )}
      </form>
    </section>
  )
}

const CoachReviews = () => {
  const state = useAsync(load)
  const [filter, setFilter] = useState('all')
  // /coach/reviews?order=<id> (from the dashboard) opens that order's panel, which scrolls itself into view.
  const target = useSearchParams()[0].get('order')
  const [openId, setOpenId] = useState(target)

  return (
    <>
      {/* Banner section: header and filter sit on the map. It runs edge to edge and up under the nav; the card grid starts below it. */}
      <section className="relative isolate -mt-8 mx-[calc(50%-50vw)] md:min-h-[300px]">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-full overflow-hidden md:h-[300px]">
          <img src={banner} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-navy-950/50" />
          <div className="absolute inset-x-0 bottom-0 h-[130px] bg-gradient-to-t from-navy-950 to-transparent" />
        </div>
        <div className="mx-auto w-full max-w-[1650px] px-6 pb-6 pt-8 lg:px-8">
          <PageHeader title="Review Player" sub="Write a performance review for players who finished all 3 sessions" />
          <div className="flex flex-wrap gap-2">{FILTERS.map(([k, l]) => <Pill key={k} active={filter === k} onClick={() => setFilter(k)}>{l}</Pill>)}</div>
        </div>
      </section>

      {/* Keep the page on screen while it reloads after a save. */}
      <Async state={{ ...state, loading: state.loading && !state.data }}>
        {({ orders, sessions }) => {
          const sessionsOf = (o) => sessions.filter((s) => s.orderId === o.id)
          const lastDate = (o) => sessionsOf(o).map((s) => s.scheduledAt).sort().pop()
          const stage = (o) => (!o.performanceReview ? 0 : !o.rating ? 1 : 2) // 0 to review, 1 awaiting rating, 2 rated
          const shown = (o) => filter === 'all' || (filter === 'todo' ? !o.performanceReview : !!o.performanceReview) || o.id === openId // the open card never disappears

          // Only finished orders (all sessions completed). To review first, then awaiting rating, then rated; newest first inside each group.
          const finished = orders.filter((o) => sessionsOf(o).filter((s) => s.status === 'completed').length === o.totalSessions)
          const rows = finished.filter(shown).sort((a, b) => stage(a) - stage(b) || lastDate(b).localeCompare(lastDate(a)))
          const open = rows.find((o) => o.id === openId)

          return (
            <>
              {rows.length ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {rows.map((o) => <PlayerReviewCard key={o.id} order={o} open={openId === o.id} onOpen={() => setOpenId(o.id)} />)}
                </div>
              ) : <Empty>{EMPTY[filter]}</Empty>}
              {open && <ReviewPanel key={open.id} order={open} locked={!!open.rating} onDone={() => setOpenId(null)} onSaved={state.reload} />}
            </>
          )
        }}
      </Async>
    </>
  )
}
export default CoachReviews
