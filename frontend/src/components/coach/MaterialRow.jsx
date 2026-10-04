import { useState } from 'react'
import { youtubeThumb } from '../../utils/youtube'

// One small line under a recording card: thumbnail, type badge, title, tagline and an Open link. `m` is session.material.
const MaterialRow = ({ m }) => {
  const [failed, setFailed] = useState(false)
  const thumb = m.thumbnailUrl || youtubeThumb(m.link) // no thumbnail at all = nothing drawn
  return (
    <div className="mt-3 flex items-center gap-3 border-t border-white/10 pt-3">
      {thumb && !failed && <img src={thumb} alt="" aria-hidden="true" onError={() => setFailed(true)} className="aspect-video w-14 shrink-0 rounded-md bg-black object-cover" />}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="shrink-0 rounded-md bg-white px-1.5 py-0.5 font-display text-xs font-semibold uppercase tracking-wide text-navy-950">{m.type}</span>
          <p className="truncate font-display text-sm font-semibold uppercase text-white">{m.title}</p>
        </div>
        {m.tagline && <p className="truncate text-xs text-white/60">{m.tagline}</p>}
      </div>
      <a href={m.link} target="_blank" rel="noopener noreferrer" className="shrink-0 font-display text-xs font-semibold uppercase tracking-wide text-white hover:underline">Open</a>
    </div>
  )
}
export default MaterialRow
