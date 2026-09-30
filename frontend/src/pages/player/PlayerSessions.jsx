import { useState } from 'react'
import { Link } from 'react-router'
import { getMe, getOrders, getSessions } from '../../api/player'
import { laneLabel } from '../../data/coaches'
import { useAsync } from '../../hooks/useAsync'
import { Async, Empty, PageHeader, Pill, btn, fmtDate } from '../../components/player/ui'

const FILTERS = [['all', 'All'], ['scheduled', 'Upcoming'], ['completed', 'Completed']]
const load = async () => { const [orders, sessions, me] = await Promise.all([getOrders(), getSessions(), getMe()]); return { orders, sessions, me } }

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
                    <div key={s.id} className="flex flex-col gap-3 border-b border-white/10 px-6 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">Session {s.sessionNumber}/{s.totalSessions}</p>
                        <p className="text-sm text-white/60">{fmtDate(s.scheduledAt, me.timezone)}</p>
                      </div>
                      {s.status === 'completed' ? <span className="text-sm font-semibold text-cyan-glow">Completed</span>
                        : s.meetingLink ? <a href={s.meetingLink} target="_blank" rel="noopener noreferrer" className={btn}>Join meeting</a>
                        : <span className="text-sm text-gold-400">Waiting for link</span>}
                    </div>
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
