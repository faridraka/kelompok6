import { useState } from 'react'
import { useNavigate } from 'react-router'
import { changePassword, getMe } from '../../api/player'
import { useAsync } from '../../hooks/useAsync'
import { Async, PageHeader, btn, btnGhost } from '../../components/player/ui'

const input = 'w-full border border-white/10 bg-navy-950 px-3 py-3 text-sm text-white focus:border-royal-500 focus:outline-none'

const PlayerAccount = () => {
  const navigate = useNavigate()
  const state = useAsync(getMe)
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [msg, setMsg] = useState(null)
  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (form.newPassword.length < 8) return setMsg({ err: 'New password must be at least 8 characters.' })
    if (form.newPassword !== form.confirm) return setMsg({ err: 'Passwords do not match.' })
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword })
      setForm({ currentPassword: '', newPassword: '', confirm: '' })
      setMsg({ ok: 'Password updated.' })
    } catch (err) { setMsg({ err: err.message }) }
  }
  const logout = () => { localStorage.removeItem('metagames_session'); navigate('/login') }

  return (
    <>
      <PageHeader title="My Account" />
      <Async state={state}>
        {(me) => (
          <div className="max-w-xl space-y-10">
            <div className="border border-white/10 bg-navy-900/70 backdrop-blur-sm p-6">
              <p className="font-semibold text-white">{me.name}</p>
              <p className="text-sm text-white/60">{me.email}</p>
            </div>
            <form onSubmit={submit} className="space-y-4 border border-white/10 bg-navy-900/70 backdrop-blur-sm p-6" noValidate>
              <h2 className="font-display text-xl font-bold uppercase text-white">Change password</h2>
              {[['currentPassword', 'Current password', 'current-password'], ['newPassword', 'New password', 'new-password'], ['confirm', 'Confirm new password', 'new-password']].map(([n, l, ac]) => (
                <label key={n} className="block text-xs font-semibold text-white/70">{l}
                  <input type="password" name={n} value={form[n]} onChange={set} autoComplete={ac} className={`${input} mt-1.5`} />
                </label>
              ))}
              {msg?.err && <p className="text-xs text-red-300">{msg.err}</p>}
              {msg?.ok && <p className="text-xs text-cyan-glow">{msg.ok}</p>}
              <button type="submit" className={btn}>Update password</button>
            </form>
            <button type="button" onClick={logout} className={btnGhost}>Log out</button>
          </div>
        )}
      </Async>
    </>
  )
}
export default PlayerAccount
