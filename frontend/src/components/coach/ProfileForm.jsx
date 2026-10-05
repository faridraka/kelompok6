import { useState } from 'react'
import { saveCoachProfile, uploadCoachAvatar } from '../../api/coach'
import { LANES } from '../../data/coaches'
import { profileChanged } from '../../hooks/useCoachProfile'
import { formatIDR } from '../../utils/format'
import { btn, btnGhost, card, input } from './ui'

const MAX_LANES = 3
const BIO_MAX = 300
const label = 'block text-xs text-white/60'
const startOf = (c) => ({ name: c.name, academyLabel: c.academyLabel, peakRank: c.peakRank, mainHero: c.mainHero, price: String(c.price), bio: c.bio, lanes: c.lanes, discordUsername: c.discordUsername ?? '' })

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
  const change = (patch) => { setF({ ...f, ...patch }); setSaved(false) }
  const text = (key) => ({ value: f[key], onChange: (e) => change({ [key]: e.target.value }), className: `${input} mt-1` })
  const full = f.lanes.length >= MAX_LANES
  const toggle = (key) => change({ lanes: LANES.map((l) => l.key).filter((k) => (k === key ? !f.lanes.includes(k) : f.lanes.includes(k))) })

  const pickAvatar = (picked) => {
    setError(''); setSaved(false)
    if (!picked) { setAvatarFile(null); setPreview(coach.avatar ?? null); return }
    if (!picked.type.startsWith('image/')) return setError('Only image files are allowed (png, jpg, webp).')
    setAvatarFile(picked)
    setPreview((old) => { if (old?.startsWith('blob:')) URL.revokeObjectURL(old); return URL.createObjectURL(picked) })
  }

  const reset = () => { setF(startOf(coach)); setAvatarFile(null); setPreview(coach.avatar ?? null); setError(''); setSaved(false) }

  const save = async (e) => {
    e.preventDefault()
    if (!f.name.trim()) return setError('Enter a display name.')
    if (f.price === '') return setError('Enter a price (0 or more).')
    if (!f.lanes.length) return setError('Pick at least 1 lane.')
    if (!f.discordUsername.trim()) return setError('Enter your Discord username.')
    setBusy(true); setError('')
    try {
      let avatar
      if (avatarFile) {
        setPhase('Uploading avatar…')
        avatar = (await uploadCoachAvatar(avatarFile)).url
      }
      setPhase('Saving…')
      await saveCoachProfile({ name: f.name.trim(), academyLabel: f.academyLabel.trim(), peakRank: f.peakRank.trim(), mainHero: f.mainHero.trim(), price: Number(f.price), bio: f.bio.trim(), lanes: f.lanes, avatar, discordUsername: f.discordUsername.trim() })
      profileChanged() // the nav chip loads the new name
      await onSaved()
      setAvatarFile(null)
      setSaved(true)
    } catch (err) { setError(err.message) }
    finally { setBusy(false); setPhase('') }
  }

  const initials = (f.name || coach.name).split(' ').map((w) => w[0]).join('').slice(0, 2)

  return (
    <form onSubmit={save} className={`${card} space-y-4 p-6`}>
      <div className="flex items-center gap-4">
        {preview
          ? <img src={preview} alt="" className="h-20 w-20 rounded-full border border-white/10 object-cover" />
          : <div aria-hidden="true" className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 font-display text-2xl font-bold uppercase text-white/70">{initials}</div>}
        <label className={label}>Avatar
          <input type="file" accept="image/*" onChange={(e) => pickAvatar(e.target.files[0])} className={`${input} mt-1`} />
        </label>
      </div>
      <label className={label}>Display name
        <input type="text" {...text('name')} />
      </label>
      <label className={label}>Discord username
        <input type="text" placeholder="coach_name" {...text('discordUsername')} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label}>Academy label
          <input type="text" {...text('academyLabel')} />
        </label>
        <label className={label}>Peak rank
          <input type="text" {...text('peakRank')} />
        </label>
        <label className={label}>Main hero
          <input type="text" {...text('mainHero')} />
        </label>
        <label className={label}>Price per package
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
