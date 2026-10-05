import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { getCoachOrders, getCoachSessions } from '../../api/coach'
import banner from '../../assets/coach/schedule-banner.webp'
import NextSessionCard from '../../components/coach/NextSessionCard'
import SessionDetail from '../../components/coach/SessionDetail'
import WeekBoard from '../../components/coach/WeekBoard'
import { plural } from '../../components/coach/stats'
import { Empty, btn, btnGhost, card } from '../../components/coach/ui'
import { Async, PageHeader, Pill } from '../../components/player/ui'
import { useAsync } from '../../hooks/useAsync'
import { laneLabel } from '../../data/coaches'
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
    const key = dayKey(s.scheduledAt) || dayKey(new Date())
    setWeekStart(mondayOf(key))
    setTimeout(toDetail) // after React has redrawn the board
  }

  // Everything the page draws, once the data is there (kept while it reloads after a save).
  // Unscheduled sessions sort last so the NEXT card prefers the closest dated session.
  const byDateNullsLast = (a, b) => (!a.scheduledAt - !b.scheduledAt) || (a.scheduledAt ?? '').localeCompare(b.scheduledAt ?? '')
  const view = state.data && (() => {
    const { orders, sessions } = state.data
    const upcoming = sessions.filter((s) => s.status === 'scheduled').sort(byDateNullsLast)
    const next = upcoming[0] // the closest unfinished session: the NEXT card and the NEXT tag on the board
    const selected = sessions.find((s) => s.id === pick) ?? next ?? [...sessions].sort(byDate).at(-1)
    const today = dayKey(new Date())
    const start = weekStart ?? mondayOf(selected?.scheduledAt ? dayKey(selected.scheduledAt) : today)
    // One column per day of the shown week; the filter only decides which sessions are drawn.
    const visible = sessions.filter((s) => filter === 'all' || s.status === filter).sort(byDate)
    const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))
    const columns = days.map((day) => ({ day, list: visible.filter((s) => dayKey(s.scheduledAt) === day) }))
    // Summary of the shown week (not affected by the filter).
    const week = sessions.filter((s) => days.includes(dayKey(s.scheduledAt)))
    // Sessions with no date yet (e.g. right after payment): they can't sit on the week board.
    const unscheduled = sessions
      .filter((s) => s.status === 'scheduled' && !s.scheduledAt)
      .sort((a, b) => a.orderId.localeCompare(b.orderId) || a.sessionNumber - b.sessionNumber)
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
          <PageHeader title="Schedule" sub="Set the date for each session, then mark it as completed." />
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
                {view.unscheduled.length > 0 && <> · <span className="font-semibold text-gold-400">{plural(view.unscheduled.length, 'session')} waiting for schedule</span></>}
              </p>
            </>
          ) : <Async state={state}>{() => null}</Async>}
        </div>
      </section>

      {view && (
        <>
          {view.columns.every((c) => !c.list.length)
            ? <Empty>No sessions this week.</Empty>
            : <WeekBoard columns={view.columns} orders={view.orders} today={view.today} selectedId={view.selected?.id} nextId={view.next?.id} onSelect={select} />}

          {view.unscheduled.length > 0 && (
            <section aria-label="Waiting for schedule" className={`${card} mt-6`}>
              <div className="border-b border-white/10 px-5 py-3">
                <h2 className="font-display text-lg font-bold uppercase text-white">Waiting for schedule</h2>
                <p className="text-xs text-white/60">Pick one to set its date. The end is +60 minutes automatically.</p>
              </div>
              {view.unscheduled.map((s) => {
                const o = view.orders.find((x) => x.id === s.orderId)
                return (
                  <div key={s.id} className="flex flex-col gap-2 border-b border-white/10 px-5 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{o?.player.name} · Session {s.sessionNumber}/{s.totalSessions}</p>
                      <p className="text-xs text-white/60">{o?.id.toUpperCase()} · {o && laneLabel(o.lane)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-gold-400">Waiting for schedule</span>
                      <button type="button" onClick={() => select(s.id)} className={btn}>Select</button>
                    </div>
                  </div>
                )
              })}
            </section>
          )}

          {view.selected && (
            <SessionDetail s={view.selected} o={view.orders.find((o) => o.id === view.selected.orderId)} onSaved={state.reload}
              onMoved={(iso) => { setWeekStart(mondayOf(dayKey(iso))); setPick(view.selected.id) }} />
          )}
        </>
      )}
    </>
  )
}
export default CoachSchedule
