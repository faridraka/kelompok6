import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { getCoachOrders, getCoachSessions } from '../../api/coach'
import banner from '../../assets/coach/schedule-banner.webp'
import NextSessionCard from '../../components/coach/NextSessionCard'
import SessionDetail from '../../components/coach/SessionDetail'
import WeekBoard from '../../components/coach/WeekBoard'
import { plural } from '../../components/coach/stats'
import { Empty, btnGhost } from '../../components/coach/ui'
import { Async, PageHeader, Pill } from '../../components/player/ui'
import { useAsync } from '../../hooks/useAsync'
import { addDays, dayKey, mondayOf, rangeLabel } from '../../utils/schedule'

const FILTERS = [['all', 'All'], ['scheduled', 'Upcoming'], ['completed', 'Completed']]
const load = async () => {
  const [orders, sessions] = await Promise.all([getCoachOrders(), getCoachSessions()])
  return { orders, sessions }
}
const byDate = (a, b) => (a.scheduledAt ?? '').localeCompare(b.scheduledAt ?? '')
const toDetail = () => document.getElementById('session-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

const CoachSchedule = () => {
  const state = useAsync(load)
  const [filter, setFilter] = useState('all')
  // /coach/schedule?session=<id> (from the dashboard): the board jumps to that week, selects it and scrolls to the panel.
  const target = useSearchParams()[0].get('session')
  const [pick, setPick] = useState(target) // selected session id; null = the closest unfinished session
  const [weekStart, setWeekStart] = useState(null) // Monday of the shown week; null = the selected session's week
  const scrolled = useRef(false)
  useEffect(() => {
    if (!state.data || !target || scrolled.current) return
    scrolled.current = true // scroll only once, not after every save
    toDetail()
  }, [state.data, target])

  const select = (id) => {
    setPick(id)
    if (window.matchMedia('(max-width: 767px)').matches) toDetail() // on mobile the panel is far below the agenda
  }
  // The NEXT card's button: select that session, move the board to its week, then jump to the panel.
  const showSession = (s) => {
    setPick(s.id)
    setWeekStart(mondayOf(dayKey(s.scheduledAt)))
    setTimeout(toDetail) // after React has redrawn the board
  }

  // Everything the page draws, once the data is there (kept while it reloads after a save).
  // Real BE sessions can be unscheduled (scheduledAt null): they are listed separately
  // below the board and scheduled from the detail panel. Date sorts are null-safe.
  const view = state.data && (() => {
    const { orders, sessions } = state.data
    // Only sessions whose order the coach can see. A session without a matching order (e.g. one
    // belonging to an order the API hides) would render with an undefined order and crash on o.lane.
    const orderIds = new Set(orders.map((o) => o.id))
    const mine = sessions.filter((s) => orderIds.has(s.orderId))
    const scheduled = mine.filter((s) => s.scheduledAt)
    const unscheduled = mine.filter((s) => !s.scheduledAt && s.status !== 'completed').sort((a, b) => a.sessionNumber - b.sessionNumber)
    const upcoming = scheduled.filter((s) => s.status === 'scheduled').sort(byDate)
    const next = upcoming[0] // the closest unfinished session: the NEXT card and the NEXT tag on the board
    const selected = mine.find((s) => s.id === pick) ?? next ?? [...mine].sort(byDate).at(-1)
    const today = dayKey(new Date())
    const start = weekStart ?? mondayOf(selected?.scheduledAt ? dayKey(selected.scheduledAt) : today)
    // One column per day of the shown week; the filter only decides which sessions are drawn.
    // Unscheduled sessions have no day, so they never enter the board (shown in their own list).
    const visible = scheduled.filter((s) => filter === 'all' || s.status === filter).sort(byDate)
    const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))
    const columns = days.map((day) => ({ day, list: visible.filter((s) => dayKey(s.scheduledAt) === day) }))
    // Summary of the shown week (not affected by the filter).
    const week = scheduled.filter((s) => days.includes(dayKey(s.scheduledAt)))
    return { orders, next, selected, today, start, columns, total: week.length, unscheduled }
  })()

  return (
    <>
      {/* Banner section: header, Next session, filter, week navigator and summary sit on the map. It runs edge to edge and up under the nav. */}
      <section className="relative isolate -mt-8 mx-[calc(50%-50vw)] md:min-h-[430px]">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-full overflow-hidden md:h-[430px]">
          <img src={banner} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-navy-950/50" />
          <div className="absolute inset-x-0 bottom-0 h-[170px] bg-gradient-to-t from-navy-950 to-transparent" />
        </div>

        <div className="mx-auto w-full max-w-[1650px] px-6 pb-6 pt-8 lg:px-8">
          <PageHeader title="Schedule" sub="Times are picked by players at checkout and fixed. Mark each session as completed." />
          {view ? (
            <>
              {/* Not affected by the filter or the shown week. */}
              <NextSessionCard s={view.next} o={view.next && view.orders.find((o) => o.id === view.next.orderId)} today={view.today} onView={() => showSession(view.next)} />

              <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">{FILTERS.map(([k, l]) => <Pill key={k} active={filter === k} onClick={() => setFilter(k)}>{l}</Pill>)}</div>
                <div className="flex items-center gap-2">
                  <button type="button" aria-label="Previous week" onClick={() => setWeekStart(addDays(view.start, -7))} className={`${btnGhost} bg-navy-950/60`}><FiChevronLeft aria-hidden="true" /></button>
                  <span className="min-w-36 text-center font-display text-sm font-semibold uppercase tracking-wide text-white">{rangeLabel(view.start)}</span>
                  <button type="button" aria-label="Next week" onClick={() => setWeekStart(addDays(view.start, 7))} className={`${btnGhost} bg-navy-950/60`}><FiChevronRight aria-hidden="true" /></button>
                  <button type="button" onClick={() => setWeekStart(mondayOf(view.today))} className={`${btnGhost} bg-navy-950/60`}>This week</button>
                </div>
              </div>

              <p className="text-sm text-white/70">
                {plural(view.total, 'session')} this week
              </p>
            </>
          ) : <Async state={state}>{() => null}</Async>}
        </div>
      </section>

      {view && (
        <>
          {view.unscheduled.length > 0 && (
            <section aria-label="Needs scheduling" className="mb-6 rounded-md border border-gold-400/40 bg-navy-900/70 p-4">
              <p className="font-display text-sm font-bold uppercase tracking-wide text-gold-400">
                Needs scheduling ({view.unscheduled.length})
              </p>
              <p className="mt-1 text-xs text-white/60">New orders arrive without a date. Pick one to set its time in the panel below.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {view.unscheduled.map((s) => {
                  const o = view.orders.find((x) => x.id === s.orderId)
                  return (
                    <button key={s.id} type="button" onClick={() => select(s.id)}
                      className={`${btnGhost} ${view.selected?.id === s.id ? 'border-white text-white' : ''}`}>
                      {o?.player?.name ?? 'Player'} · Session {s.sessionNumber}/{s.totalSessions}
                    </button>
                  )
                })}
              </div>
            </section>
          )}
          {view.columns.every((c) => !c.list.length)
            ? <Empty>No sessions this week.</Empty>
            : <WeekBoard columns={view.columns} orders={view.orders} today={view.today} selectedId={view.selected?.id} nextId={view.next?.id} onSelect={select} />}

          {view.selected && (
            <SessionDetail s={view.selected} o={view.orders.find((o) => o.id === view.selected.orderId)} onSaved={state.reload} />
          )}
        </>
      )}
    </>
  )
}
export default CoachSchedule
