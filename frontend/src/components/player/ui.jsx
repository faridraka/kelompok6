export const PageHeader = ({ title, sub }) => (
  <div className="mb-8">
    <h1 className="font-display text-3xl font-bold uppercase text-white lg:text-4xl">{title}</h1>
    {sub && <p className="mt-2 text-sm text-white/60">{sub}</p>}
  </div>
)

export const Async = ({ state, children }) =>
  state.loading ? <p className="text-sm text-white/50">Loading…</p>
  : state.error ? <p className="text-sm text-red-300">{state.error.message}</p>
  : children(state.data)

export const Empty = ({ children }) => <div className="border border-white/10 bg-navy-900/70 backdrop-blur-sm px-6 py-10 text-center text-sm text-white/50">{children}</div>

export const fmtDate = (iso, tz) =>
  new Date(iso).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: tz })

export const Pill = ({ active, ...p }) => (
  <button type="button" aria-pressed={active} {...p}
    className={`rounded-full px-4 py-2 font-display text-xs font-semibold uppercase tracking-wide transition-colors ${active ? 'bg-white text-navy-950' : 'bg-white/10 text-white hover:bg-white/20'}`} />
)

export const btn = 'inline-flex items-center justify-center bg-royal-500 px-4 py-2 font-display text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-royal-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-glow'
export const btnGhost = 'inline-flex items-center justify-center border border-white/15 px-4 py-2 font-display text-xs font-semibold uppercase tracking-wide text-white/70 transition-colors hover:border-white/30 hover:text-white'
