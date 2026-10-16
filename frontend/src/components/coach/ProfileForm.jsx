import { useRef, useState } from 'react'
import { FiCamera, FiEdit2 } from 'react-icons/fi'
import { saveCoachProfile, uploadCoachAvatar } from '../../api/coach'
import { LANES } from '../../data/coaches'
import { profileChanged } from '../../hooks/useCoachProfile'
import { formatIDR } from '../../utils/format'
import { btn, btnGhost, card, input } from './ui'

const MAX_LANES = 3
const BIO_MAX = 300
// The backend avatar route (backend/src/routes/upload.route.js) only checks the
// image/* mime type and sets no size cap, so the form enforces a 2 MB client
// limit with a clear error instead of uploading an oversized file.
const AVATAR_MAX_BYTES = 2 * 1024 * 1024
const label = 'block text-xs text-white/60'
const startOf = (c) => ({ name: c.name ?? '', peakRank: c.peakRank ?? '', mainHero: c.mainHero ?? '', price: c.price == null ? '' : String(c.price), bio: c.bio ?? '', lanes: c.lanes ?? [] })

// Edit side of the profile page. Save uploads a new avatar first (if picked), then sends the whole form;
// Reset puts back what is saved.
const ProfileForm = ({ coach, onSaved }) => {
  const [f, setF] = useState(() => startOf(coach))
  const [avatarFile, setAvatarFile] = useState(null)
  const [preview, setPreview] = useState(coach.avatar ?? null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)
  const [phase, setPhase] = useState('')
  const fileRef = useRef(null)
  const change = (patch) => { setF({ ...f, ...patch }); setSaved(false) }
  const text = (key) => ({ value: f[key], onChange: (e) => change({ [key]: e.target.value }), className: `${input} mt-1` })
  const full = f.lanes.length >= MAX_LANES
  const toggle = (key) => change({ lanes: LANES.map((l) => l.key).filter((k) => (k === key ? !f.lanes.includes(k) : f.lanes.includes(k))) })

  const pickAvatar = (picked) => {
    setError(''); setSaved(false)
    if (!picked) { setAvatarFile(null); setPreview(coach.avatar ?? null); return }
    if (!picked.type.startsWith('image/')) return setError('Only image files are allowed (png, jpg, webp).')
    if (picked.size > AVATAR_MAX_BYTES) return setError('Avatar must be 2 MB or smaller.')
    setAvatarFile(picked)
    setPreview((old) => { if (old?.startsWith('blob:')) URL.revokeObjectURL(old); return URL.createObjectURL(picked) })
  }

  const reset = () => { setF(startOf(coach)); setAvatarFile(null); setPreview(coach.avatar ?? null); setError(''); setSaved(false) }

  const save = async (e) => {
    e.preventDefault()
    if (!f.name.trim()) return setError('Enter a display name.')
    if (f.price === '') return setError('Enter a price (0 or more).')
    if (!f.lanes.length) return setError('Pick at least 1 lane.')
    setBusy(true); setError('')
    try {
      let avatar
      if (avatarFile) {
        setPhase('Uploading avatar…')
        avatar = (await uploadCoachAvatar(avatarFile)).url
      }
      setPhase('Saving…')
      await saveCoachProfile({ name: f.name.trim(), peakRank: f.peakRank.trim(), mainHero: f.mainHero.trim(), price: Number(f.price), bio: f.bio.trim(), lanes: f.lanes, avatar })
      profileChanged() // the nav chip loads the new name
      await onSaved()
      setAvatarFile(null)
      setSaved(true)
    } catch (err) { setError(err.message) }
    finally { setBusy(false); setPhase('') }
  }

  const initials = (f.name || coach.name || '').split(' ').map((w) => w[0]).join('').slice(0, 2)

  return (
    <form onSubmit={save} className={`${card} space-y-4 p-6`}>
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-label="Change profile photo"
            className="group relative block h-24 w-24 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {preview
              ? <img src={preview} alt="" className="h-24 w-24 rounded-full border border-white/10 object-cover transition-opacity group-hover:opacity-70 group-focus-visible:opacity-70" />
              : <span aria-hidden="true" className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10 font-display text-2xl font-bold uppercase text-white/70 transition-opacity group-hover:opacity-70 group-focus-visible:opacity-70">{initials}</span>}
            <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              <FiCamera className="h-6 w-6 text-white" />
            </span>
            <span aria-hidden="true" className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-royal-500 text-white">
              <FiEdit2 className="h-3.5 w-3.5" />
            </span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={(e) => pickAvatar(e.target.files[0])} className="hidden" tabIndex={-1} aria-hidden="true" />
          <span className="mt-2 text-xs text-white/40">Tap to change photo</span>
        </div>
      </div>
      <label className={label}>Display name
        <input type="text" {...text('name')} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label}>Peak rank
          <input type="text" {...text('peakRank')} />
        </label>
        <label className={label}>Main hero
          <input type="text" {...text('mainHero')} />
        </label>
        <label className={`${label} sm:col-span-2`}>Price per package
          {/* Digits only; shown as Rp. */}
          <input type="text" inputMode="numeric" value={f.price === '' ? '' : formatIDR(f.price)} onChange={(e) => change({ price: e.target.value.replace(/\D/g, '') })} className={`${input} mt-1`} />
        </label>
      </div>
      <label className={label}>Bio
        <textarea rows={4} maxLength={BIO_MAX} {...text('bio')} className={`${input} mt-1 resize-y`} />
        <span className="mt-1 block text-right text-xs text-white/40">{f.bio.length}/{BIO_MAX}</span>
      </label>

      <fieldset>
        <legend className={label}>Lanes</legend>
        <div className="mt-1 flex flex-wrap gap-2">
          {LANES.map(({ key, label: name }) => {
            const on = f.lanes.includes(key)
            return (
              <button key={key} type="button" aria-pressed={on} disabled={!on && full} onClick={() => toggle(key)}
                className={`rounded-md border px-4 py-3 font-display text-xs font-semibold uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${on ? 'border-white bg-white text-navy-950' : 'border-white/10 text-white/70 hover:border-white/30 hover:text-white'}`}>
                {name}
              </button>
            )
          })}
        </div>
        {full && <p className="mt-2 text-xs text-white/60">Pick up to 3 lanes</p>}
      </fieldset>

      {error && <p className="text-xs text-gold-400">{error}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={busy} className={btn}>{busy ? phase || 'Saving…' : 'Save changes'}</button>
        <button type="button" onClick={reset} disabled={busy} className={btnGhost}>Reset</button>
        {saved && <span role="status" className="text-xs text-white/70">Profile saved</span>}
      </div>
    </form>
  )
}
export default ProfileForm
