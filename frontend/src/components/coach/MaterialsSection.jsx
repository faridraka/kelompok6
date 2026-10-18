import { useState } from 'react'
import { createCoachMaterial, getCoachMaterials, uploadCoachMaterial } from '../../api/coach'
import { useAsync } from '../../hooks/useAsync'
import { Async } from '../player/ui'
import { Empty, btn, btnGhost, card, input } from './ui'

// Fields follow the MATERIALS table: type (guide | fundamental), title, tagline, description, thumbnail_url, link.
// id and created_at come from the database. `link` is the storage URL returned by POST /uploads/materials.
const TYPES = [['guide', 'Guide'], ['fundamental', 'Fundamental']]
const TYPE_LABEL = Object.fromEntries(TYPES)
const BLANK = { type: 'guide', title: '', tagline: '', description: '' }
// Mirrors backend/src/routes/upload.route.js: pdf/image/video, 50 MB cap.
const MAX_BYTES = 50 * 1024 * 1024
const CONTENT_EXT = /\.(pdf|png|jpg|jpeg|webp|mp4|mkv|webm|mov|m4v|avi|ogv)$/i
const okContent = (f) => f.type === 'application/pdf' || f.type.startsWith('image/') || f.type.startsWith('video/') || CONTENT_EXT.test(f.name)
const mb = (bytes) => `${(bytes / 1048576).toFixed(1)} MB`
const fmt = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' })

const Field = ({ label, error, children }) => (
  <label className="block text-xs text-white/60">
    {label}
    {children}
    {error && <span className="mt-1 block text-xs text-gold-400">{error}</span>}
  </label>
)

export const MaterialForm = ({ onDone, onSaved }) => {
  const [f, setF] = useState(BLANK)
  const [contentFile, setContentFile] = useState(null)
  const [thumbFile, setThumbFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [phase, setPhase] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const pickContent = (picked) => {
    setErrors((prev) => ({ ...prev, content: undefined }))
    if (!picked) return setContentFile(null)
    if (!okContent(picked)) { setContentFile(null); return setErrors((prev) => ({ ...prev, content: 'File must be a pdf, image, or video.' })) }
    if (picked.size > MAX_BYTES) { setContentFile(null); return setErrors((prev) => ({ ...prev, content: 'File must be 50 MB or smaller.' })) }
    setContentFile(picked)
  }

  const pickThumb = (picked) => {
    setErrors((prev) => ({ ...prev, thumbnail: undefined }))
    if (!picked) return setThumbFile(null)
    if (!picked.type.startsWith('image/')) { setThumbFile(null); return setErrors((prev) => ({ ...prev, thumbnail: 'Thumbnail must be an image.' })) }
    setThumbFile(picked)
  }

  const save = async (e) => {
    e.preventDefault()
    const next = {}
    if (!f.title.trim()) next.title = 'Required'
    if (!contentFile) next.content = 'Required'
    setErrors(next)
    if (Object.keys(next).length) return
    setBusy(true); setError('')
    try {
      setPhase('Uploading file…')
      const { url } = await uploadCoachMaterial(contentFile)
      let thumbnailUrl = null
      if (thumbFile) {
        setPhase('Uploading thumbnail…')
        thumbnailUrl = (await uploadCoachMaterial(thumbFile)).url
      }
      setPhase('Saving…')
      await createCoachMaterial({
        type: f.type,
        title: f.title.trim(),
        tagline: f.tagline.trim() || null,
        description: f.description.trim() || null,
        thumbnailUrl,
        link: url,
      })
      await onSaved()
      onDone()
    } catch (err) { setError(err.message) }
    finally { setBusy(false); setPhase('') }
  }

  return (
    <form onSubmit={save} className={`${card} mb-4 space-y-4 px-5 py-5`}>
      <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-white">New material</h3>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <Field label="Type">
            <select value={f.type} onChange={set('type')} className={`${input} mt-1`}>
              {TYPES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </Field>
          <Field label="Title" error={errors.title}>
            <input type="text" value={f.title} onChange={set('title')} className={`${input} mt-1`} />
          </Field>
          <Field label="Tagline (optional)">
            <input type="text" value={f.tagline} onChange={set('tagline')} className={`${input} mt-1`} />
          </Field>
        </div>
        <div className="space-y-4">
          <Field label="Description (optional)">
            <textarea rows={3} value={f.description} onChange={set('description')} className={`${input} mt-1 resize-y`} />
          </Field>
          <Field label="File (pdf, image, or video · max 50 MB)" error={errors.content}>
            <input type="file" accept=".pdf,image/*,video/*" onChange={(e) => pickContent(e.target.files[0])} className={`${input} mt-1`} />
            {contentFile && <span className="mt-1 block text-xs text-white/50">{contentFile.name} · {mb(contentFile.size)}</span>}
          </Field>
          <Field label="Thumbnail image (optional)" error={errors.thumbnail}>
            <input type="file" accept="image/*" onChange={(e) => pickThumb(e.target.files[0])} className={`${input} mt-1`} />
            {thumbFile && <span className="mt-1 block text-xs text-white/50">{thumbFile.name} · {mb(thumbFile.size)}</span>}
          </Field>
        </div>
      </div>
      {error && <p className="text-xs text-gold-400">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className={btn}>{busy ? phase || 'Saving…' : 'Save material'}</button>
        <button type="button" onClick={onDone} disabled={busy} className={btnGhost}>Cancel</button>
      </div>
    </form>
  )
}

export const MaterialCard = ({ m }) => (
  <article className={`${card} flex flex-col overflow-hidden`}>
    {m.thumbnailUrl && <img src={m.thumbnailUrl} alt="" className="aspect-video w-full border-b border-white/10 object-cover" />}
    <div className="flex flex-1 flex-col p-5">
      <p className="text-xs uppercase tracking-wide text-white/60">{TYPE_LABEL[m.type]}{m.tagline ? ` · ${m.tagline}` : ''}</p>
      <h3 className="mt-2 font-display text-lg font-bold uppercase leading-tight text-white">{m.title}</h3>
      {m.description && <p className="mt-2 text-sm leading-relaxed text-white/70">{m.description}</p>}
      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        <span className="text-xs text-white/50">{fmt(m.createdAt)}</span>
        <a href={m.link} target="_blank" rel="noopener noreferrer" className={btnGhost}>Open</a>
      </div>
    </div>
  </article>
)

// Inline section variant: the existing materials, plus a form to add one.
const MaterialsSection = () => {
  const state = useAsync(getCoachMaterials)
  const [adding, setAdding] = useState(false)

  return (
    <section id="materials" className="mt-10 scroll-mt-24">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold uppercase text-white">Materials</h2>
        {!adding && <button type="button" onClick={() => setAdding(true)} className={btn}>Add material</button>}
      </div>
      {adding && <MaterialForm onDone={() => setAdding(false)} onSaved={state.reload} />}
      <Async state={{ ...state, loading: state.loading && !state.data }}>
        {(items) => items.length
          ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{items.map((m) => <MaterialCard key={m.id} m={m} />)}</div>
          : <Empty>No materials yet.</Empty>}
      </Async>
    </section>
  )
}
export default MaterialsSection
