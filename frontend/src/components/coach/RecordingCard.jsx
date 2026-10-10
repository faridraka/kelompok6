import { useState } from 'react'
import { FiPlay, FiPlus } from 'react-icons/fi'
import { saveCoachRecording, uploadCoachVod } from '../../api/coach'
import { frameFromFile, setFrame, thumbSource } from '../../utils/videoThumb'
import { fmtDate } from '../player/ui'
import { btn, btnGhost, input } from './ui'

const TZ = 'Asia/Jakarta'
const VIDEO_ACCEPT = 'video/*,.mkv'
const VIDEO_EXT = /\.(mp4|mkv|webm|mov|m4v|avi|ogv)$/i

// Form that replaces the bottom panel. A video file is uploaded to object storage (R2, mocked)
// and its URL is saved to the session on Save.
const RecordForm = ({ s, onDone, onSaved }) => {
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [phase, setPhase] = useState('')

  const pick = async (f) => {
    setError('')
    if (!f) return setFile(null)
    if (!f.type.startsWith('video/') && !VIDEO_EXT.test(f.name)) {
      setFile(null)
      return setError('Only video files are allowed (mp4, mkv, webm, mov).')
    }
    setFile(f)
    setFrame(s.id, await frameFromFile(f)) // instant thumbnail preview while picking
  }

  const cancel = () => { setFrame(s.id, null); onDone() }

  const save = async () => {
    let url = s.vod?.url ?? ''
    if (!file && !url) return setError('Pick a video file.')
    setBusy(true); setError('')
    try {
      if (file) {
        setPhase('Uploading…')
        url = (await uploadCoachVod(file)).url
      }
      setPhase('Saving…')
      await saveCoachRecording(s.id, { url })
      await onSaved(); onDone()
    } catch (e) { setError(e.message); setBusy(false); setPhase('') }
  }

  return (
    <div className="space-y-3">
      <label className="block text-xs text-white/60">VOD file (mp4, mkv, webm, mov)
        <input type="file" accept={VIDEO_ACCEPT} onChange={(e) => pick(e.target.files[0])} className={`${input} mt-1`} />
      </label>
      {file
        ? <p className="text-xs text-white/70">{file.name} · {(file.size / 1048576).toFixed(1)} MB — uploads to storage on Save</p>
        : s.vod && <p className="truncate text-xs text-white/50">Current: {s.vod.url}</p>}
      {error && <p className="text-xs text-gold-400">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={save} disabled={busy} className={btn}>{busy ? phase || 'Saving…' : 'Save'}</button>
        <button type="button" onClick={cancel} disabled={busy} className={btnGhost}>Cancel</button>
      </div>
    </div>
  )
}

// The picture inside the thumbnail. If it fails to load, nothing is drawn and the black background stays.
const Media = ({ media }) => {
  const [failed, setFailed] = useState(false)
  if (!media || failed) return null
  const cls = 'absolute inset-0 h-full w-full object-cover'
  return media.type === 'video'
    ? <video src={`${media.src}#t=0.5`} preload="metadata" muted playsInline onError={() => setFailed(true)} className={cls} />
    : <img src={media.src} alt="" aria-hidden="true" onError={() => setFailed(true)} className={cls} />
}

// One completed session as a video thumbnail card: the thumbnail on top, the status and actions below.
const RecordingCard = ({ s, order, editing, onEdit, onDone, onSaved }) => {
  const media = s.vod ? thumbSource(s.id, s.vod) : null // no recording = no media = plain black
  const base = 'relative block aspect-video w-full overflow-hidden rounded-t-md bg-black'
  const content = (
    <>
      <Media key={media?.src} media={media} />
      {media && <span className="absolute inset-0 bg-navy-950/30" />}
      <span className="absolute left-3 top-3 rounded-md bg-navy-950/80 px-2 py-1 font-display text-xs font-semibold uppercase tracking-wide text-white">
        Session {s.sessionNumber}/{s.totalSessions}
      </span>
      {s.vod ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-14 items-center justify-center rounded-full border border-white/60 text-2xl text-white"><FiPlay aria-hidden="true" /></span>
        </span>
      ) : (
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gold-400/60 text-gold-400">
          <FiPlus aria-hidden="true" className="text-3xl" />
          <span className="text-xs">No recording yet</span>
        </span>
      )}
    </>
  )

  return (
    <article id={`session-${s.id}`} className="scroll-mt-24">
      {s.vod
        ? <a href={s.vod.url} target="_blank" rel="noopener noreferrer" aria-label="Watch recording" className={base}>{content}</a>
        : <button type="button" onClick={() => onEdit(s.id)} aria-label="Add recording" className={base}>{content}</button>}
      <div className="rounded-b-md border border-white/10 bg-navy-900/70 p-4 backdrop-blur-sm">
        {editing ? <RecordForm s={s} onDone={onDone} onSaved={onSaved} /> : (
          <>
            <p className="font-display text-lg font-semibold uppercase text-white">{order.player.name}</p>
            <p className="text-xs text-white/60">{fmtDate(s.scheduledAt, TZ)} · {order.id.toUpperCase()}</p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              {s.vod ? (
                <>
                  <span className="text-sm text-white/70">Recording added</span>
                  <div className="flex gap-2">
                    <a href={s.vod.url} target="_blank" rel="noopener noreferrer" className={btn}>Watch</a>
                    <button type="button" onClick={() => onEdit(s.id)} className={btnGhost}>Replace</button>
                  </div>
                </>
              ) : (
                <>
                  <span className="text-sm font-semibold text-gold-400">No recording</span>
                  <button type="button" onClick={() => onEdit(s.id)} className={btn}>Add recording</button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </article>
  )
}
export default RecordingCard
