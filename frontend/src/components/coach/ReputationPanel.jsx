import { plural } from './stats'

// Average, star distribution and the newest comment. Every number comes from ratingStats() (rating history + rated orders), the same result the hero uses.
const ReputationPanel = ({ stats }) => {
  const latest = stats.latest[0]
  return (
    <div className="h-full rounded-md border border-white/10 bg-royal-600 p-6">
      <h2 className="font-display text-xl font-bold uppercase text-white">Reputation</h2>
      {stats.n ? (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-x-10 gap-y-4">
            <div>
              <p className="font-display text-6xl font-bold leading-none text-cyan-glow">{stats.avg.toFixed(1)}</p>
              <p className="mt-2 text-sm text-white/70">from {plural(stats.n, 'rating')}</p>
            </div>
            <div className="min-w-48 flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map((star, i) => (
                <div key={star} className="flex items-center gap-3 text-xs text-white/70">
                  <span className="w-3">{star}</span>
                  <span className="h-2 flex-1 rounded-md bg-white/20"><span className="block h-full rounded-md bg-white" style={{ width: `${(stats.counts[i] / stats.n) * 100}%` }} /></span>
                  <span className="w-4 text-right">{stats.counts[i]}</span>
                </div>
              ))}
            </div>
          </div>
          <figure className="mt-6 border-t border-white/10 pt-5">
            <blockquote className="text-sm text-white/90">“{latest.comment}”</blockquote>
            <figcaption className="mt-1 text-xs text-white/70">{latest.playerNickname} · {latest.rating}/5</figcaption>
          </figure>
        </>
      ) : <p className="mt-4 text-sm text-white/70">No ratings yet.</p>}
    </div>
  )
}
export default ReputationPanel
