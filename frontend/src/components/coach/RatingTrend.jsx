import { card } from './ui'

// Inline SVG line chart, no chart library. One point per month that has ratings, months without ratings are just skipped by the line.
// Scale is 3 to 5; it widens downwards only when a month averages below 3. `months` comes from monthlyRatings().
const W = 640
const H = 260
const PAD = { top: 40, right: 28, bottom: 40, left: 40 }

const RatingTrend = ({ months }) => {
  const data = months.filter((m) => m.avg !== null)
  const enough = data.length >= 2
  const low = Math.min(3, Math.floor(Math.min(...data.map((m) => m.avg))))
  const ticks = Array.from({ length: 5 - low + 1 }, (_, i) => low + i)
  const x = (i) => PAD.left + (i * (W - PAD.left - PAD.right)) / (months.length - 1)
  const y = (v) => PAD.top + ((5 - v) / (5 - low)) * (H - PAD.top - PAD.bottom)
  const base = H - PAD.bottom
  const pts = months.map((m, i) => (m.avg === null ? null : { x: x(i), y: y(m.avg), v: m.avg })).filter(Boolean)
  const line = pts.map((p) => `${p.x},${p.y}`).join(' ')
  const last = pts[pts.length - 1]

  return (
    <div className={`${card} h-full p-6`}>
      <h2 className="font-display text-xl font-bold uppercase text-white">Rating trend</h2>
      <p className="mt-1 text-sm text-white/60">Average rating per month, last 6 months</p>
      {enough ? (
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Average rating per month" className="mt-4 h-auto w-full">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} className="stroke-white/10" />
              <text x={PAD.left - 10} y={y(t) + 4} textAnchor="end" className="fill-white/60 text-[13px]">{t}</text>
            </g>
          ))}
          <polygon points={`${pts[0].x},${base} ${line} ${last.x},${base}`} className="fill-cyan-glow/[0.14]" />
          <polyline points={line} fill="none" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" className="stroke-cyan-glow" />
          {pts.map((p) => <circle key={p.x} cx={p.x} cy={p.y} r="5" className="fill-cyan-glow" />)}
          <text x={last.x} y={last.y - 14} textAnchor="middle" className="fill-cyan-glow font-display text-[16px] font-bold">{last.v.toFixed(1)}</text>
          {months.map((m, i) => <text key={m.key} x={x(i)} y={H - 14} textAnchor="middle" className="fill-white/60 text-[13px]">{m.label}</text>)}
        </svg>
      ) : <p className="mt-6 text-sm text-white/60">Not enough ratings yet</p>}
    </div>
  )
}
export default RatingTrend
