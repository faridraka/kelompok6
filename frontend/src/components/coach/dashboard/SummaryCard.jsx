const SummaryCard = ({ label, value, accent = 'default' }) => {
  const accentClass = {
    default: 'text-white',
    gold:    'text-gold-400',
    cyan:    'text-cyan-glow',
    red:     'text-red-400',
  }[accent] ?? 'text-white'

  return (
    <div className="flex flex-col gap-1 border border-white/10 bg-navy-900 px-6 py-5">
      <p className="font-display text-xs font-medium uppercase tracking-[0.22em] text-periwinkle-300">
        {label}
      </p>
      <p className={`font-display text-4xl font-bold leading-none ${accentClass}`}>
        {value}
      </p>
    </div>
  )
}

export default SummaryCard
