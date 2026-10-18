import { laneLabel } from '../../data/coaches'
import { formatIDR } from '../../utils/format'
import { laneIcon } from './laneIcons'
import { card } from './ui'

// Wallet summary + transactions from getCoachWallet(). Every number is normalized
// in api/coach.js; `wallet` is null when the call failed, so the section still renders.
const formatDate = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short', year: 'numeric' })
}

const badge = (status) => status === 'Available'
  ? 'border-cyan-glow/40 text-cyan-glow'
  : 'border-gold-400/40 text-gold-400'

const WalletCard = ({ wallet = null }) => (
  <section id="wallet" aria-label="Coach wallet" className={`${card} scroll-mt-24 p-6`}>
    <h2 className="font-display text-xl font-bold uppercase text-white">Wallet</h2>

    {!wallet ? (
      <p className="mt-4 text-sm text-white/60">Wallet is unavailable right now.</p>
    ) : (
      <>
        <div className="mt-4 flex flex-wrap items-end gap-x-10 gap-y-4">
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.26em] text-white/70">Available</p>
            <p className="mt-1 font-display text-4xl font-bold leading-none text-cyan-glow">{formatIDR(wallet.available)}</p>
          </div>
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.26em] text-white/70">Pending</p>
            <p className="mt-1 font-display text-2xl font-bold leading-none text-gold-400">{formatIDR(wallet.pending)}</p>
          </div>
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.26em] text-white/70">Total earned</p>
            <p className="mt-1 font-display text-2xl font-bold leading-none text-white">{formatIDR(wallet.totalEarned)}</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-white/50">{wallet.players} order(s)</p>

        {wallet.transactions.length ? (
          <ul className="mt-5 divide-y divide-white/10 border-t border-white/10">
            {wallet.transactions.map((t) => (
              <li key={t.id} className="flex items-center gap-3 py-3">
                {laneIcon(t.lane)
                  ? <img src={laneIcon(t.lane)} alt="" aria-hidden="true" className="h-8 w-8 shrink-0 object-contain" />
                  : <span aria-hidden="true" className="h-8 w-8 shrink-0 rounded-md bg-white/10" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{t.playerName}</p>
                  <p className="mt-0.5 text-xs text-white/50">{laneLabel(t.lane)} · {formatDate(t.date)}</p>
                </div>
                <p className="shrink-0 font-mono text-sm text-white/90">{formatIDR(t.amount)}</p>
                <span className={`shrink-0 rounded-md border px-2 py-0.5 font-display text-[11px] font-semibold uppercase tracking-wide ${badge(t.status)}`}>{t.status}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 border-t border-white/10 pt-5 text-center text-sm text-white/50">No earnings yet.</p>
        )}
      </>
    )}
  </section>
)
export default WalletCard
