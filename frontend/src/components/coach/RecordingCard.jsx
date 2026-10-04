import { useState } from 'react'
import { FiPlay, FiPlus } from 'react-icons/fi'
import { saveCoachRecording } from '../../api/coach'
import { draftOf, readDraft } from '../../utils/material'
import { thumbSource } from '../../utils/videoThumb'
import { isHttpUrl } from '../../utils/youtube'
import { fmtDate } from '../player/ui'
import MaterialFields from './MaterialFields'
import MaterialRow from './MaterialRow'
import { btn, btnGhost, input } from './ui'

const TZ = 'Asia/Jakarta'

// Form that replaces the bottom panel. The recording link is required; the material block is optional.
// Remove material empties and closes the block, and Save then deletes the material from the session.
const RecordForm = ({ s, onDone, onSaved }) => {
  const [url, setUrl] = useState(s.vod?.url ?? '')
  const [open, setOpen] = useState(!!s.material) // opens by itself when the session already has a material
  const [draft, setDraft] = useState(() => draftOf(s.material))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const save = async () => {
    const link = url.trim()
    if (!link) return setError('Enter the VOD link.')
    if (!isHttpUrl(link)) return setError('Link must start with http:// or https://')
    const { material, error: problem } = open ? readDraft(draft) : { material: null } // empty block = no material
    if (problem) return setError(problem)
    setBusy(true); setError('')
    try { await saveCoachRecording(s.id, { url: link, material }); await onSaved(); onDone() }
    catch (e) { setError(e.message); setBusy(false) }
  }

  return (
    <div className="space-y-3">
      <label className="block text-xs text-white/60">VOD link
        <input type="text" inputMode="url" placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} className={`${input} mt-1`} />
      </label>
      <MaterialFields open={open} draft={draft} onChange={setDraft} onOpen={() => setOpen(true)} onRemove={() => { setDraft(draftOf(null)); setOpen(false) }} />
      {error && <p className="text-xs text-gold-400">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={save} disabled={busy} className={btn}>Save</button>
        <button type="button" onClick={onDone} disabled={busy} className={btnGhost}>Cancel</button>
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
            {s.material && <MaterialRow key={s.material.id + s.material.thumbnailUrl} m={s.material} />}
          </>
        )}
      </div>
    </article>
  )
}
export default RecordingCard
