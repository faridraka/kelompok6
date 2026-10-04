import { useState } from 'react'
import { createCoachMaterial, getCoachMaterials } from '../../api/coach'
import { useAsync } from '../../hooks/useAsync'
import { Async } from '../player/ui'
import { Empty, btn, btnGhost, card, input } from './ui'

// Fields follow the MATERIALS table: type (guide | fundamental), title, tagline, description, thumbnail_url, link.
// id and created_at come from the database.
const TYPES = [['guide', 'Guide'], ['fundamental', 'Fundamental']]
const TYPE_LABEL = Object.fromEntries(TYPES)
const BLANK = { type: 'guide', title: '', tagline: '', description: '', thumbnailUrl: '', link: '' }
const validUrl = (v) => /^https?:\/\/\S+$/i.test(v)
const fmt = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' })

const Field = ({ label, error, children }) => (
  <label className="block text-xs text-white/60">
    {label}
    {children}
    {error && <span className="mt-1 block text-xs text-gold-400">{error}</span>}
  </label>
)

const MaterialForm = ({ onDone, onSaved }) => {
  const [f, setF] = useState(BLANK)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const save = async (e) => {
    e.preventDefault()
    const body = { ...f, title: f.title.trim(), tagline: f.tagline.trim(), description: f.description.trim(), thumbnailUrl: f.thumbnailUrl.trim(), link: f.link.trim() }
    const next = {}
    if (!body.title) next.title = 'Required'
    if (!body.tagline) next.tagline = 'Required'
    if (!body.link) next.link = 'Required'
    else if (!validUrl(body.link)) next.link = 'Must start with http:// or https://'
    if (body.thumbnailUrl && !validUrl(body.thumbnailUrl)) next.thumbnailUrl = 'Must start with http:// or https://'
    setErrors(next)
    if (Object.keys(next).length) return
    setBusy(true); setError('')
    try { await createCoachMaterial(body); await onSaved(); onDone() }
    catch (err) { setError(err.message); setBusy(false) }
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
          <Field label="Tagline" error={errors.tagline}>
            <input type="text" value={f.tagline} onChange={set('tagline')} className={`${input} mt-1`} />
          </Field>
        </div>
        <div className="space-y-4">
          <Field label="Description (optional)">
            <textarea rows={3} value={f.description} onChange={set('description')} className={`${input} mt-1 resize-y`} />
          </Field>
          <Field label="Thumbnail URL (optional)" error={errors.thumbnailUrl}>
            <input type="text" inputMode="url" placeholder="https://..." value={f.thumbnailUrl} onChange={set('thumbnailUrl')} className={`${input} mt-1`} />
          </Field>
          <Field label="Link (unlisted YouTube)" error={errors.link}>
            <input type="text" inputMode="url" placeholder="https://..." value={f.link} onChange={set('link')} className={`${input} mt-1`} />
          </Field>
        </div>
      </div>
      {error && <p className="text-xs text-gold-400">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className={btn}>Save material</button>
        <button type="button" onClick={onDone} disabled={busy} className={btnGhost}>Cancel</button>
      </div>
    </form>
  )
}

const MaterialCard = ({ m }) => (
  <article className={`${card} flex flex-col overflow-hidden`}>
    {m.thumbnailUrl && <img src={m.thumbnailUrl} alt="" className="aspect-video w-full border-b border-white/10 object-cover" />}
    <div className="flex flex-1 flex-col p-5">
      <p className="text-xs uppercase tracking-wide text-white/60">{TYPE_LABEL[m.type]} · {m.tagline}</p>
      <h3 className="mt-2 font-display text-lg font-bold uppercase leading-tight text-white">{m.title}</h3>
      {m.description && <p className="mt-2 text-sm leading-relaxed text-white/70">{m.description}</p>}
      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        <span className="text-xs text-white/50">{fmt(m.createdAt)}</span>
        <a href={m.link} target="_blank" rel="noopener noreferrer" className={btnGhost}>Open</a>
      </div>
    </div>
  </article>
)

// Section "Materials" on Review Player: the existing materials, plus a form to add one.
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
