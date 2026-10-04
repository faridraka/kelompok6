import { FiChevronRight } from 'react-icons/fi'

const STATUS_LABEL = {
  confirmed: { text: 'Confirmed', className: 'text-cyan-glow' },
  waiting_link: { text: 'Waiting Link', className: 'text-gold-400' },
  pending: { text: 'Pending', className: 'text-white/50' },
}

const formatDate = (dateStr) => {
  const d = new Date(dateStr)

  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

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
      <div className="hidden grid-cols-[1fr_1fr_auto_1fr_auto_auto] gap-4 border-b border-white/10 px-6 py-3 md:grid">
        {['Player', 'Game', 'Session', 'Date & Time', 'Status', ''].map((h) => (
          <p
            key={h}
            className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40"
          >
            {h}
          </p>
        ))}
      </div>

      {sessions.map((s, i) => {
        const status = STATUS_LABEL[s.status] ?? STATUS_LABEL.pending

        return (
          <div
            key={s.id}
            className={`flex flex-col gap-3 px-6 py-4 md:grid md:grid-cols-[1fr_1fr_auto_1fr_auto_auto] md:items-center md:gap-4 ${
              i < sessions.length - 1 ? 'border-b border-white/10' : ''
            }`}
          >
            <p className="font-semibold text-white">{s.playerName}</p>

            <p className="text-sm text-white/70">{s.game}</p>

            <p className="whitespace-nowrap text-sm text-periwinkle-300">
              Session {s.sessionNumber}/{s.totalSessions}
            </p>

            <p className="whitespace-nowrap text-sm text-white/70">
              {formatDate(s.date)}&nbsp;&nbsp;{s.time}
            </p>

            <p
              className={`whitespace-nowrap text-sm font-semibold ${status.className}`}
            >
              {status.text}
            </p>

            {s.meetingLink ? (
              <a
                href={s.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap bg-royal-500 px-4 py-2 font-display text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-royal-600"
              >
                Open Meeting
                <FiChevronRight className="h-2.5 w-1.5" aria-hidden="true" />
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex cursor-not-allowed items-center justify-center gap-2 whitespace-nowrap border border-white/15 px-4 py-2 font-display text-xs font-semibold uppercase tracking-wide text-white/30"
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