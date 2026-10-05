import { useState } from 'react'
import { Link } from 'react-router'
import { completeSession, getMe, getOrders, getSessions } from '../../api/player'
import { laneLabel } from '../../data/coaches'
import { useAsync } from '../../hooks/useAsync'
import { useNow } from '../../hooks/useNow'
import { hasEnded } from '../../utils/schedule'
import { Async, Empty, PageHeader, Pill, btn, fmtRange } from '../../components/player/ui'

const FILTERS = [['all', 'All'], ['scheduled', 'Upcoming'], ['completed', 'Completed']]
const load = async () => { const [orders, sessions, me] = await Promise.all([getOrders(), getSessions(), getMe()]); return { orders, sessions, me } }

const SessionRow = ({ s, timezone, onDone }) => {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const ended = hasEnded(s, useNow())

  const markComplete = async () => {
    setBusy(true); setError('')
    try { await completeSession(s.id); await onDone() }
    catch (e) { setError(e.message); setBusy(false) }
  }

  return (
    <div className="flex flex-col gap-3 border-b border-white/10 px-6 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-white">Session {s.sessionNumber}/{s.totalSessions}</p>
        {s.status === 'completed' ? (
          s.scheduledAt && <p className="text-sm text-white/60">{fmtRange(s.scheduledAt, s.scheduledEnd, timezone)}</p>
        ) : s.meetingLink ? (
          s.scheduledAt && <p className="text-sm text-white/60">{fmtRange(s.scheduledAt, s.scheduledEnd, timezone)}</p>
        ) : null}
      </div>
      {s.status === 'completed' ? <span className="text-sm font-semibold text-cyan-glow">Completed</span>
        : s.meetingLink ? (
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <div className="flex gap-2">
              <a href={s.meetingLink} target="_blank" rel="noopener noreferrer" className={btn}>Join meeting</a>
              <button type="button" onClick={markComplete} disabled={busy || !ended} className={btn}>Mark complete</button>
            </div>
            {!ended && <p className="text-xs text-white/50">Available after the session ends</p>}
            {error && <p className="text-xs text-gold-400">{error}</p>}
          </div>
        )
        : <span className="text-sm text-gold-400">Waiting for schedule</span>}
    </div>
  )
}

const PlayerSessions = () => {
  const state = useAsync(load)
  const [filter, setFilter] = useState('all')
  return (
    <>
      <PageHeader title="Sessions" sub="Your live sessions with your coaches. Your coach schedules and reschedules them." />
      <div className="mb-8 flex flex-wrap gap-2">{FILTERS.map(([k, l]) => <Pill key={k} active={filter === k} onClick={() => setFilter(k)}>{l}</Pill>)}</div>
      <Async state={state}>
        {({ orders, sessions, me }) => {
          const groups = orders.map((o) => ({ o, list: sessions.filter((s) => s.orderId === o.id && (filter === 'all' || s.status === filter)) })).filter((g) => g.list.length)
          if (!groups.length) return <Empty>No sessions to show.</Empty>
          return (
            <div className="space-y-8">
              {groups.map(({ o, list }) => (
                <section key={o.id} className="border border-white/10 bg-navy-900/70 backdrop-blur-sm">
                  <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                    <div><h2 className="font-display text-xl font-bold uppercase text-white">{o.coach.name}</h2><p className="text-xs text-periwinkle-300">{laneLabel(o.lane)}</p></div>
                    {o.status === 'awaiting_rating' && <Link to={`/player/orders/${o.id}`} className={btn}>Rate your coach</Link>}
                  </div>
                  {list.map((s) => (
                    <SessionRow key={s.id} s={s} timezone={me.timezone} onDone={state.reload} />
                  ))}
                </section>
              ))}
            </div>
          )
        }}
      </Async>
    </>
  )
}
export default PlayerSessions
