// ActiveCoaching
// Menampilkan daftar player yang sedang dalam proses coaching,
// lengkap dengan progress session (misal: 1/3, 2/3, 3/3).

// Dot progress — lingkaran kecil untuk tiap session
const SessionDots = ({ completed, total }) => (
  <div className="flex items-center gap-1.5">
    {Array.from({ length: total }).map((_, i) => (
      <span
        key={i}
        className={`block h-2 w-2 rounded-full ${
          i < completed ? 'bg-cyan-glow' : 'bg-white/20'
        }`}
      />
    ))}
    <span className="ml-1 font-display text-xs font-semibold text-white/50">
      {completed}/{total}
    </span>
  </div>
)

// Badge status berdasarkan progress
const statusBadge = (completed, total) => {
  if (completed === 0) return { text: 'Not Started', className: 'text-white/40' }
  if (completed < total) return { text: 'In Progress', className: 'text-gold-400' }
  return { text: 'Awaiting Review', className: 'text-cyan-glow' }
}

const ActiveCoaching = ({ coachingList }) => {
  if (!coachingList || coachingList.length === 0) {
    return (
      <div className="border border-white/10 bg-navy-900 px-6 py-10 text-center text-sm text-white/50">
        No active coaching.
      </div>
    )
  }

  return (
    <div className="border border-white/10 bg-navy-900">
      {/* Header */}
      <div className="hidden grid-cols-[1fr_1fr_auto_auto] gap-4 border-b border-white/10 px-6 py-3 md:grid">
        {['Player', 'Game / Role', 'Progress', 'Status'].map((h) => (
          <p key={h} className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
            {h}
          </p>
        ))}
      </div>

      {/* Baris */}
      {coachingList.map((item, i) => {
        const badge = statusBadge(item.sessionsCompleted, item.totalSessions)

        return (
          <div
            key={item.id}
            className={`flex flex-col gap-3 px-6 py-4 md:grid md:grid-cols-[1fr_1fr_auto_auto] md:items-center md:gap-4 ${
              i < coachingList.length - 1 ? 'border-b border-white/10' : ''
            }`}
          >
            {/* Player */}
            <div>
              <p className="font-semibold text-white">{item.playerName}</p>
              <p className="text-xs text-white/40">{item.orderId}</p>
            </div>

            {/* Game / Role */}
            <div>
              <p className="text-sm text-white/70">{item.game}</p>
              <p className="text-xs text-periwinkle-300">{item.role}</p>
            </div>

            {/* Progress dots */}
            <SessionDots completed={item.sessionsCompleted} total={item.totalSessions} />

            {/* Status badge */}
            <p className={`text-sm font-semibold whitespace-nowrap ${badge.className}`}>
              {badge.text}
            </p>
          </div>
        )
      })}
    </div>
  )
}

export default ActiveCoaching
