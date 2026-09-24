// UpcomingSession
// Menampilkan daftar sesi yang akan datang dalam bentuk tabel sederhana.

const STATUS_LABEL = {
  confirmed:    { text: 'Confirmed',    className: 'text-cyan-glow' },
  waiting_link: { text: 'Waiting Link', className: 'text-gold-400' },
  pending:      { text: 'Pending',      className: 'text-white/50' },
}

// Format tanggal: "2026-09-25" → "Thu, 25 Sep 2026"
const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const ArrowIcon = () => (
  <svg viewBox="0 0 8 12" className="h-2.5 w-1.5 fill-current" aria-hidden="true">
    <path d="M0 0l8 6-8 6z" />
  </svg>
)

const UpcomingSession = ({ sessions }) => {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="border border-white/10 bg-navy-900 px-6 py-10 text-center text-sm text-white/50">
        No upcoming sessions.
      </div>
    )
  }

  return (
    <div className="border border-white/10 bg-navy-900">
      {/* Header tabel — hanya tampil di md ke atas */}
      <div className="hidden grid-cols-[1fr_1fr_auto_1fr_auto_auto] gap-4 border-b border-white/10 px-6 py-3 md:grid">
        {['Player', 'Game', 'Session', 'Date & Time', 'Status', ''].map((h) => (
          <p key={h} className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
            {h}
          </p>
        ))}
      </div>

      {/* Baris data */}
      {sessions.map((s, i) => {
        const status = STATUS_LABEL[s.status] ?? STATUS_LABEL.pending

        return (
          <div
            key={s.id}
            className={`flex flex-col gap-3 px-6 py-4 md:grid md:grid-cols-[1fr_1fr_auto_1fr_auto_auto] md:items-center md:gap-4 ${
              i < sessions.length - 1 ? 'border-b border-white/10' : ''
            }`}
          >
            {/* Player */}
            <p className="font-semibold text-white">{s.playerName}</p>

            {/* Game */}
            <p className="text-sm text-white/70">{s.game}</p>

            {/* Session number */}
            <p className="text-sm text-periwinkle-300 whitespace-nowrap">
              Session {s.sessionNumber}/{s.totalSessions}
            </p>

            {/* Date & Time */}
            <p className="text-sm text-white/70 whitespace-nowrap">
              {formatDate(s.date)}&nbsp;&nbsp;{s.time}
            </p>

            {/* Status */}
            <p className={`text-sm font-semibold whitespace-nowrap ${status.className}`}>
              {status.text}
            </p>

            {/* Tombol Open Meeting */}
            {s.meetingLink ? (
              <a
                href={s.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-royal-500 px-4 py-2 font-display text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-royal-600 whitespace-nowrap"
              >
                Open Meeting
                <ArrowIcon />
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center gap-2 border border-white/15 px-4 py-2 font-display text-xs font-semibold uppercase tracking-wide text-white/30 whitespace-nowrap cursor-not-allowed"
              >
                No Link Yet
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default UpcomingSession
