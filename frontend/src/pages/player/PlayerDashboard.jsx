import { Link } from 'react-router'
import { getConfig, getMe, getOrders, getSessions } from '../../api/player'
import { laneLabel } from '../../data/coaches'
import { useAsync } from '../../hooks/useAsync'
import { Async, Empty, PageHeader, btn, btnGhost, fmtRange } from '../../components/player/ui'

const load = async () => {
  const [orders, sessions, me, config] = await Promise.all([getOrders(), getSessions(), getMe(), getConfig()])
  return { orders, sessions, me, config }
}
const Stat = ({ label, value }) => (
  <div className="border border-white/10 bg-navy-900/70 backdrop-blur-sm px-6 py-5">
    <p className="text-xs text-white/60">{label}</p>
    <p className="mt-1 font-display text-4xl font-bold text-white">{value}</p>
  </div>
)

const PlayerDashboard = () => {
  const state = useAsync(load)
  return (
    <>
      <PageHeader title="Dashboard" />
      <Async state={state}>
        {({ orders, sessions, me, config }) => {
          const upcoming = sessions.filter((s) => s.status === 'scheduled').sort((a, b) => (!a.scheduledAt - !b.scheduledAt) || (a.scheduledAt ?? '').localeCompare(b.scheduledAt ?? ''))
          const next = upcoming[0]
          const toRate = orders.filter((o) => o.status === 'awaiting_rating')
          const count = (st) => orders.filter((o) => o.status === st).length
          return (
            <div className="space-y-10">
              <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                <Stat label="Active coaching" value={count('scheduled') + count('in_progress')} />
                <Stat label="Upcoming sessions" value={upcoming.length} />
                <Stat label="Awaiting your rating" value={toRate.length} />
                <Stat label="Unpaid orders" value={count('pending_payment')} />
              </div>

              <section>
                <h2 className="mb-3 font-display text-xl font-bold uppercase text-white">Next session</h2>
                {next ? (
                  <div className="flex flex-col gap-4 border border-white/10 bg-navy-900/70 backdrop-blur-sm p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-white">{next.coach.name} · Session {next.sessionNumber}/{next.totalSessions}</p>
                      {next.scheduledAt && <p className="mt-1 text-sm text-white/60">{fmtRange(next.scheduledAt, next.scheduledEnd, me.timezone)}</p>}
                    </div>
                    {next.meetingLink ? <a href={next.meetingLink} target="_blank" rel="noopener noreferrer" className={btn}>Join meeting</a> : <span className="text-sm text-gold-400">Waiting for schedule</span>}
                  </div>
                ) : <Empty>No upcoming sessions.</Empty>}
              </section>

              {toRate.length > 0 && (
                <section>
                  <h2 className="mb-3 font-display text-xl font-bold uppercase text-white">Needs your attention</h2>
                  {toRate.map((o) => (
                    <div key={o.id} className="flex items-center justify-between gap-4 border border-gold-400/40 bg-navy-900/70 backdrop-blur-sm p-5">
                      <p className="text-sm text-white">Your review from {o.coach.name} is ready. Rate your coach to finish.</p>
                      <Link to={`/player/orders/${o.id}`} className={btn}>View review</Link>
                    </div>
                  ))}
                </section>
              )}

              <section>
                <h2 className="mb-3 font-display text-xl font-bold uppercase text-white">My coaches</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {orders.map((o) => {
                    const done = sessions.filter((s) => s.orderId === o.id && s.status === 'completed').length
                    return (
                      <div key={o.id} className="border border-white/10 bg-navy-900/70 backdrop-blur-sm p-5">
                        <p className="font-semibold text-white">{o.coach.name}</p>
                        <p className="text-xs text-periwinkle-300">{laneLabel(o.lane)}</p>
                        <div className="mt-4 flex items-center gap-1.5">
                          {Array.from({ length: o.totalSessions }).map((_, i) => <span key={i} className={`h-2 w-8 ${i < done ? 'bg-cyan-glow' : 'bg-white/20'}`} />)}
                          <span className="ml-2 text-xs text-white/60">{done}/{o.totalSessions} sessions</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <a href={config.discordInviteUrl} target="_blank" rel="noopener noreferrer" className={`${btnGhost} mt-4`}>Message your coach on Discord</a>
              </section>
            </div>
          )
        }}
      </Async>
    </>
  )
}
export default PlayerDashboard
