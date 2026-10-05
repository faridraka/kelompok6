import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { getCoachOrders, getCoachSessions } from '../../api/coach'
import banner from '../../assets/coach/schedule-banner.webp'
import RecordingCard from '../../components/coach/RecordingCard'
import { Empty } from '../../components/coach/ui'
import { Async, PageHeader, Pill } from '../../components/player/ui'
import { useAsync } from '../../hooks/useAsync'

const FILTERS = [['all', 'All'], ['needs', 'Needs recording'], ['uploaded', 'Uploaded']]
const EMPTY = { all: 'No completed sessions yet.', needs: 'No sessions need a recording.', uploaded: 'No recordings uploaded yet.' }
const load = async () => {
  const [orders, sessions] = await Promise.all([getCoachOrders(), getCoachSessions()])
  return { orders, sessions }
}

const CoachRecords = () => {
  const state = useAsync(load)
  const [filter, setFilter] = useState('all')
  // /coach/records?session=<id> (from Schedule or the dashboard) scrolls to that card and opens its form.
  const target = useSearchParams()[0].get('session')
  const [editId, setEditId] = useState(target) // only one card is in form mode at a time
  const scrolled = useRef(false)
  useEffect(() => {
    if (!state.data || !target || scrolled.current) return
    scrolled.current = true // scroll once, not after every save
    document.getElementById(`session-${target}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) // the card has scroll-mt-24 for the sticky nav
  }, [state.data, target])

  const shown = (s) => filter === 'all' || (filter === 'needs' ? !s.vod : !!s.vod) || s.id === editId // the card being edited never disappears

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
          <PageHeader title="Upload Record" sub="Upload the VOD file for each completed session." />
          <div className="flex flex-wrap gap-2">{FILTERS.map(([k, l]) => <Pill key={k} active={filter === k} onClick={() => setFilter(k)}>{l}</Pill>)}</div>
        </div>
      </section>

      {/* Keep the grid on screen while it reloads after a save. */}
      <Async state={{ ...state, loading: state.loading && !state.data }}>
        {({ orders, sessions }) => {
          const cards = sessions.filter((s) => s.status === 'completed').filter(shown).sort((a, b) => (b.scheduledAt ?? '').localeCompare(a.scheduledAt ?? '')) // newest first
          return !cards.length ? <Empty>{EMPTY[filter]}</Empty> : (
            <div className="grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cards.map((s) => (
                <RecordingCard key={s.id} s={s} order={orders.find((o) => o.id === s.orderId)}
                  editing={editId === s.id} onEdit={setEditId} onDone={() => setEditId(null)} onSaved={state.reload} />
              ))}
            </div>
          )
        }}
      </Async>
    </>
  )
}
export default CoachRecords
