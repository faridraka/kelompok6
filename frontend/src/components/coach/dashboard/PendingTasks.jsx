// PendingTasks
// Menampilkan daftar tugas coach yang belum diselesaikan.
// Tugas urgent ditandai dengan aksen gold.

// Icon untuk tiap tipe task
const TaskIcon = ({ type }) => {
  const paths = {
    schedule_session: 'M8 2v3m8-3v3M3 8h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
    add_meeting_link: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
    upload_recording: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12',
    complete_review:  'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  }

  const d = paths[type] ?? paths.complete_review

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  )
}

const PendingTasks = ({ tasks }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="border border-white/10 bg-navy-900 px-6 py-10 text-center text-sm text-white/50">
        No pending tasks. You're all caught up!
      </div>
    )
  }

  return (
    <div className="border border-white/10 bg-navy-900">
      {tasks.map((task, i) => (
        <div
          key={task.id}
          className={`flex items-start gap-4 px-6 py-4 ${
            i < tasks.length - 1 ? 'border-b border-white/10' : ''
          }`}
        >
          {/* Icon dengan warna sesuai urgency */}
          <span className={task.urgent ? 'text-gold-400' : 'text-white/40'}>
            <TaskIcon type={task.type} />
          </span>

          {/* Label + detail */}
          <div className="flex flex-1 flex-col gap-0.5">
            <p className={`text-sm font-semibold ${task.urgent ? 'text-white' : 'text-white/70'}`}>
              {task.label}
              {task.urgent && (
                <span className="ml-2 font-display text-[10px] font-bold uppercase tracking-wide text-gold-400">
                  Urgent
                </span>
              )}
            </p>
            <p className="text-xs text-white/40">{task.detail}</p>
          </div>

          {/* Tombol action — placeholder, nanti dihubungkan ke halaman terkait */}
          <button
            type="button"
            className="shrink-0 border border-white/15 px-3 py-1.5 font-display text-[11px] font-semibold uppercase tracking-wide text-white/60 transition-colors hover:border-white/30 hover:text-white"
          >
            Go
          </button>
        </div>
      ))}
    </div>
  )
}

export default PendingTasks
