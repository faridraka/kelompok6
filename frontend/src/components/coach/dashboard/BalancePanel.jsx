const formatRupiah = (amount) =>
  'Rp ' + amount.toLocaleString('id-ID')

const ArrowIcon = () => (
  <svg
    viewBox="0 0 8 12"
    className="h-2.5 w-1.5 fill-current"
    aria-hidden="true"
  >
    <path d="M0 0l8 6-8 6z" />
  </svg>
)

const BalancePanel = ({ wallet }) => {
  return (
    <div className="border border-white/10 bg-navy-900">
      <div className="grid grid-cols-1 divide-y divide-white/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="flex flex-col gap-1 px-6 py-5">
          <p className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-periwinkle-300">
            Available Balance
          </p>
          <p className="font-display text-3xl font-bold leading-none text-gold-400">
            {formatRupiah(wallet.availableBalance)}
          </p>
          <p className="mt-0.5 text-xs text-white/40">Ready to withdraw</p>
        </div>

        <div className="flex flex-col gap-1 px-6 py-5">
          <p className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-periwinkle-300">
            Pending Balance
          </p>
          <p className="font-display text-3xl font-bold leading-none text-white/60">
            {formatRupiah(wallet.pendingBalance)}
          </p>
          <p className="mt-0.5 text-xs text-white/40">
            Released after player rates
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-4">
        <button
          type="button"
          className="inline-flex items-center gap-3 bg-royal-500 px-6 py-3 font-display text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-royal-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-glow"
        >
          Withdraw Balance
          <ArrowIcon />
        </button>
        <p className="mt-2 text-xs text-white/30">
          Withdrawal requests are processed within 1–2 business days.
        </p>
      </div>
    </div>
  )
}

export default BalancePanel