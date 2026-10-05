import { card } from './ui'

// Six bars made of divs, no chart library. `weeks` comes from weeklyCompleted(): oldest first, label = the Monday of that week.
const WeeklyBars = ({ weeks }) => {
  const top = Math.max(...weeks.map((w) => w.count), 1)
  return (
    <div className={`${card} h-full p-6`}>
      <h2 className="font-display text-xl font-bold uppercase text-white">Sessions per week</h2>
      <p className="mt-1 text-sm text-white/60">Completed sessions, last 6 weeks</p>
      <div className="mt-6 flex h-44 items-end gap-3 border-b border-white/15 sm:gap-5">
        {weeks.map((w) => (
          <div key={w.key} className="flex h-full flex-1 flex-col items-center justify-end">
            <span className="mb-1 font-display text-lg font-bold leading-none text-white">{w.count}</span>
            <div className="w-full rounded-md bg-royal-500" style={{ height: `${(w.count / top) * 80}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-3 sm:gap-5">
        {weeks.map((w) => <span key={w.key} className="flex-1 text-center text-xs text-white/60">{w.label}</span>)}
      </div>
    </div>
  )
}
export default WeeklyBars
