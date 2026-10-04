import { laneLabel } from '../../data/coaches'
import { axisHours, dayName, dayNumber, hourOf, statusOf, timeOf } from '../../utils/schedule'

// Block colours: royal = link added, gold outline = needs a link, dim = completed. The selected block gets a white border.
const LOOK = (s) =>
  s.status === 'completed' ? ['border-white/10', 'bg-navy-900/50 text-white/60']
    : s.meetingLink ? ['border-royal-600', 'bg-royal-600 text-white']
      : ['border-gold-400/60', 'bg-navy-900/70 text-white']

// One session block. Clicking it selects the session; the form lives in the detail panel.
const SessionBlock = ({ s, o, selected, isNext, onSelect }) => {
  const [border, fill] = LOOK(s)
  const [label, tone] = statusOf(s)
  return (
    <button type="button" onClick={() => onSelect(s.id)} aria-pressed={selected}
      className={`block w-full min-w-0 rounded-md border-2 p-2 text-left transition-colors ${selected ? 'border-white' : border} ${fill}`}>
      <span className="flex items-center justify-between gap-1">
        <span className="font-display text-lg font-bold leading-none">{timeOf(s.scheduledAt)}</span>
        {isNext && <span className="rounded-md bg-white px-1.5 py-0.5 font-display text-[10px] font-semibold uppercase tracking-wide text-navy-950">Next</span>}
      </span>
      <span className="mt-1 block truncate font-display text-sm font-semibold uppercase">{o.player.name}</span>
      <span className="block text-[11px] opacity-70">Session {s.sessionNumber}/{s.totalSessions} · {laneLabel(o.lane)}</span>
      <span className={`mt-1 block text-[11px] font-semibold ${tone}`}>{label}</span>
    </button>
  )
}

const DayHead = ({ day, today }) => (
  <div className="flex items-baseline gap-2 md:block">
    <p className="flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-[0.26em] text-periwinkle-300">
      {dayName(day)}
      {day === today && <span className="rounded-md bg-white px-1.5 py-0.5 text-[10px] tracking-wide text-navy-950">Today</span>}
    </p>
    <p className="font-display text-3xl font-bold leading-none text-white">{dayNumber(day)}</p>
  </div>
)

const ROW = 'grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))]' // hour axis + Mon-Sun
const BOX = 'rounded-md border border-white/10 bg-navy-900/40'

// `columns` is [{ day: "YYYY-MM-DD", list: [sessions sorted by time] }], one per day of the shown week.
// md and up: a time grid (hours down the left, days across). Below md: an agenda of the days that have sessions.
const WeekBoard = ({ columns, orders, today, selectedId, nextId, onSelect }) => {
  const block = (s) => <SessionBlock key={s.id} s={s} o={orders.find((o) => o.id === s.orderId)} selected={s.id === selectedId} isNext={s.id === nextId} onSelect={onSelect} />
  const hours = axisHours(columns.flatMap((c) => c.list.map((s) => hourOf(s.scheduledAt))))

  return (
    <>
      <div className={`${BOX} hidden overflow-hidden md:block`}>
        <div className={`${ROW} border-b border-white/10`}>
          <div />
          {columns.map(({ day }) => <div key={day} className="min-w-0 border-l border-white/10 px-2 py-3"><DayHead day={day} today={today} /></div>)}
        </div>
        {hours.map((h, i) => (
          <div key={h} className={`${ROW} border-t border-white/10 first:border-t-0`}>
            <p className="px-2 pt-3 text-right font-display text-xs font-semibold text-white/50">{String(h).padStart(2, '0')}:00</p>
            {columns.map(({ day, list }) => (
              <div key={day} className="min-h-28 min-w-0 space-y-2 border-l border-white/10 p-2">
                {list.filter((s) => hourOf(s.scheduledAt) === h).map(block)}
                {i === 0 && !list.length && <p className="py-6 text-center text-white/30">–</p>}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="space-y-4 md:hidden">
        {columns.filter((c) => c.list.length).map(({ day, list }) => (
          <div key={day}>
            <div className="mb-2"><DayHead day={day} today={today} /></div>
            <div className={`${BOX} space-y-2 p-2`}>{list.map(block)}</div>
          </div>
        ))}
      </div>
    </>
  )
}
export default WeekBoard
