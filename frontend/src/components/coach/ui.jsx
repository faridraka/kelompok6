// Coach-only style helpers (player/ui.jsx stays untouched).
// One corner radius for every coach element: rounded-md. Royal blue = action buttons only.
export const card = 'rounded-md border border-white/10 bg-navy-900/70 backdrop-blur-sm'
export const label = 'font-display text-xs font-semibold uppercase tracking-[0.26em] text-white/70'
export const btn = 'inline-flex items-center justify-center rounded-md bg-royal-500 px-4 py-2 font-display text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-royal-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-royal-500'
// Dark button, readable on top of a royal-blue block.
export const btnDark = 'inline-flex items-center justify-center rounded-md bg-navy-950 px-4 py-2 font-display text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-40'
export const btnGhost = 'inline-flex items-center justify-center rounded-md border border-white/15 px-4 py-2 font-display text-xs font-semibold uppercase tracking-wide text-white/70 transition-colors hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40'
export const input = 'w-full rounded-md border border-white/10 bg-navy-950/60 px-3 py-2 text-sm text-white scheme-dark placeholder:text-white/40 focus-visible:outline-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-60'
export const Empty = ({ children }) => <div className={`${card} px-6 py-10 text-center text-sm text-white/50`}>{children}</div>
