import { getMe, getSessions } from '../../api/player'
import { useAsync } from '../../hooks/useAsync'
import { Async, Empty, PageHeader, btn, btnGhost, fmtDate } from '../../components/player/ui'

const load = async () => { const [sessions, me] = await Promise.all([getSessions(), getMe()]); return { sessions, me } }

const PlayerVods = () => {
  const state = useAsync(load)
  return (
    <>
      <PageHeader title="Coaching VODs" sub="Recordings of your completed sessions." />
      <Async state={state}>
        {({ sessions, me }) => {
          const vods = sessions.filter((s) => s.vod).sort((a, b) => (b.scheduledAt ?? '').localeCompare(a.scheduledAt ?? ''))
          if (!vods.length) return <Empty>No recordings yet. They appear after your coach uploads them.</Empty>
          return (
            <div className="border border-white/10 bg-navy-900/70 backdrop-blur-sm">
              {vods.map((s) => (
                <div key={s.id} className="flex flex-col gap-3 border-b border-white/10 px-6 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{s.coach.name} · Session {s.sessionNumber}/{s.totalSessions}</p>
                    <p className="text-sm text-white/60">{fmtDate(s.scheduledAt, me.timezone)}</p>
                  </div>
                  <div className="flex gap-2">
                    <a href={s.vod.url} target="_blank" rel="noopener noreferrer" className={btn}>Watch</a>
                    <a href={s.vod.downloadUrl} download className={btnGhost}>Download</a>
                  </div>
                </div>
              ))}
            </div>
          )
        }}
      </Async>
    </>
  )
}
export default PlayerVods
