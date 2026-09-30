import { useEffect, useMemo, useState } from 'react'
import { FiCheck, FiRotateCcw, FiSave, FiAlertCircle } from 'react-icons/fi'

// TODO: sesuaikan endpoint dengan backend kamu
const API_URL = '/api/players/me'

const ROLES = ['Tank', 'Fighter', 'Assassin', 'Mage', 'Marksman', 'Support']

const RANKS = [
  'Warrior',
  'Elite',
  'Master',
  'Grandmaster',
  'Epic',
  'Legend',
  'Mythic',
  'Mythical Honor',
  'Mythical Glory',
  'Mythical Immortal',
]

const LANES = ['EXP Lane', 'Gold Lane', 'Mid Lane', 'Jungle', 'Roam']

const EMPTY_PROFILE = {
  name: '',
  game_id: '',
  server_id: '',
  game_role: '',
  current_rank: '',
  preferred_hero: '',
  favorite_lanes: [],
  bio: '',
}

const inputClass =
  'w-full rounded-lg border border-white/10 bg-navy-900 px-4 py-3 text-sm text-white placeholder:text-white/30 transition-colors focus:border-royal-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-glow/40'

const Field = ({ label, htmlFor, hint, error, children }) => (
  <div>
    <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-white/80">
      {label}
    </label>
    {children}
    {error ? (
      <p className="mt-1.5 text-xs text-red-400">{error}</p>
    ) : (
      hint && <p className="mt-1.5 text-xs text-white/40">{hint}</p>
    )}
  </div>
)

const ProfilePage = () => {
  const [saved, setSaved] = useState(EMPTY_PROFILE)
  const [form, setForm] = useState(EMPTY_PROFILE)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null) // { type: 'success' | 'error', message }

  useEffect(() => {
    const controller = new AbortController()

    const load = async () => {
      try {
        const res = await fetch(API_URL, { signal: controller.signal })
        if (res.status === 404) return // belum punya profile, tampilkan form kosong
        if (!res.ok) throw new Error()
        const data = await res.json()
        const profile = { ...EMPTY_PROFILE, ...data, favorite_lanes: data.favorite_lanes ?? [] }
        setSaved(profile)
        setForm(profile)
      } catch (err) {
        if (err.name !== 'AbortError') {
          setStatus({ type: 'error', message: 'Profile gagal dimuat. Coba muat ulang halaman.' })
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [])

  const isDirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(saved), [form, saved])

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
    setStatus(null)
  }

  const toggleLane = (lane) =>
    setField(
      'favorite_lanes',
      form.favorite_lanes.includes(lane)
        ? form.favorite_lanes.filter((l) => l !== lane)
        : [...form.favorite_lanes, lane],
    )

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Nama wajib diisi.'
    if (form.game_id && !/^\d+$/.test(form.game_id)) next.game_id = 'Game ID hanya boleh angka.'
    if (form.server_id && !/^\d+$/.test(form.server_id)) next.server_id = 'Server ID hanya boleh angka.'
    if (form.bio.length > 200) next.bio = 'Bio maksimal 200 karakter.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    setStatus(null)
    try {
      const res = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, name: form.name.trim() }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json().catch(() => form)
      const profile = { ...form, ...data, favorite_lanes: data.favorite_lanes ?? form.favorite_lanes }
      setSaved(profile)
      setForm(profile)
      setStatus({ type: 'success', message: 'Perubahan tersimpan.' })
    } catch {
      setStatus({ type: 'error', message: 'Perubahan gagal disimpan. Periksa koneksi lalu coba lagi.' })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setForm(saved)
    setErrors({})
    setStatus(null)
  }

  const initial = (form.name.trim()[0] || '?').toUpperCase()

  if (loading) {
    return <div className="p-6 text-sm text-white/50 lg:p-10">Memuat profile…</div>
  }

  return (
    <div className="mx-auto max-w-3xl p-6 lg:p-10">
      <header className="mb-8 flex items-center gap-4">
        <div
          aria-hidden="true"
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-royal-500 to-royal-700 font-display text-2xl font-bold text-white shadow-lg shadow-royal-500/20"
        >
          {initial}
        </div>
        <div className="min-w-0">
          <h1 className="truncate font-display text-2xl font-bold text-white">
            {saved.name || 'Profile kamu'}
          </h1>
          <p className="text-sm text-white/50">
            {[saved.current_rank, saved.game_role].filter(Boolean).join(' • ') ||
              'Lengkapi data supaya coach bisa mengenal gaya mainmu.'}
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        <section aria-labelledby="identity" className="space-y-5 rounded-xl bg-navy-900/60 p-6">
          <h2 id="identity" className="font-display text-lg font-semibold text-white">
            Identitas
          </h2>

          <Field label="Nama" htmlFor="name" error={errors.name}>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              className={inputClass}
              placeholder="Nama yang tampil di profile"
              aria-invalid={!!errors.name}
              autoComplete="name"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Game ID" htmlFor="game_id" error={errors.game_id}>
              <input
                id="game_id"
                type="text"
                inputMode="numeric"
                value={form.game_id}
                onChange={(e) => setField('game_id', e.target.value)}
                className={inputClass}
                placeholder="12345678"
                aria-invalid={!!errors.game_id}
              />
            </Field>
            <Field label="Server ID" htmlFor="server_id" error={errors.server_id}>
              <input
                id="server_id"
                type="text"
                inputMode="numeric"
                value={form.server_id}
                onChange={(e) => setField('server_id', e.target.value)}
                className={inputClass}
                placeholder="1234"
                aria-invalid={!!errors.server_id}
              />
            </Field>
          </div>

          <Field
            label="Bio"
            htmlFor="bio"
            error={errors.bio}
            hint={`${form.bio.length}/200 karakter`}
          >
            <textarea
              id="bio"
              rows={3}
              value={form.bio}
              onChange={(e) => setField('bio', e.target.value)}
              className={`${inputClass} resize-none`}
              placeholder="Ceritakan singkat tentang gaya mainmu"
              aria-invalid={!!errors.bio}
            />
          </Field>
        </section>

        <section aria-labelledby="gameplay" className="space-y-5 rounded-xl bg-navy-900/60 p-6">
          <h2 id="gameplay" className="font-display text-lg font-semibold text-white">
            Gaya bermain
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Role" htmlFor="game_role">
              <select
                id="game_role"
                value={form.game_role}
                onChange={(e) => setField('game_role', e.target.value)}
                className={inputClass}
              >
                <option value="">Pilih role</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Rank saat ini" htmlFor="current_rank">
              <select
                id="current_rank"
                value={form.current_rank}
                onChange={(e) => setField('current_rank', e.target.value)}
                className={inputClass}
              >
                <option value="">Pilih rank</option>
                {RANKS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Hero andalan" htmlFor="preferred_hero">
            <input
              id="preferred_hero"
              type="text"
              value={form.preferred_hero}
              onChange={(e) => setField('preferred_hero', e.target.value)}
              className={inputClass}
              placeholder="Contoh: Ling"
            />
          </Field>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-white/80">Lane favorit</legend>
            <div className="flex flex-wrap gap-2">
              {LANES.map((lane) => {
                const selected = form.favorite_lanes.includes(lane)
                return (
                  <button
                    key={lane}
                    type="button"
                    onClick={() => toggleLane(lane)}
                    aria-pressed={selected}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-glow ${
                      selected
                        ? 'border-royal-500 bg-royal-500/20 text-white'
                        : 'border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {selected && <FiCheck className="h-4 w-4 text-cyan-glow" aria-hidden="true" />}
                    {lane}
                  </button>
                )
              })}
            </div>
            <p className="mt-1.5 text-xs text-white/40">Boleh pilih lebih dari satu.</p>
          </fieldset>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={!isDirty || saving}
            className="inline-flex items-center gap-2 rounded-lg bg-royal-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-royal-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-glow disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiSave className="h-4 w-4" aria-hidden="true" />
            {saving ? 'Menyimpan…' : 'Simpan perubahan'}
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={!isDirty || saving}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-3 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiRotateCcw className="h-4 w-4" aria-hidden="true" />
            Batalkan
          </button>

          <p
            role="status"
            aria-live="polite"
            className={`flex items-center gap-1.5 text-sm ${
              status?.type === 'error' ? 'text-red-400' : 'text-emerald-400'
            }`}
          >
            {status && (
              <>
                {status.type === 'error' ? (
                  <FiAlertCircle className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <FiCheck className="h-4 w-4" aria-hidden="true" />
                )}
                {status.message}
              </>
            )}
          </p>
        </div>
      </form>
    </div>
  )
}

export default ProfilePage
