    import { LANES } from '../../data/coaches'

    const LaneFilter = ({ selected, onToggle }) => {
    return (
        <div className="flex flex-wrap gap-2">
        <button
            type="button"
            onClick={() => onToggle(null)}
            className={`rounded-full px-4 py-2 font-display text-xs font-semibold uppercase tracking-wide transition-colors ${
            selected.size === 0 ? 'bg-white text-navy-950' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
        >
            All Coaches
        </button>

        {LANES.map((lane) => {
            const active = selected.has(lane.key)
            return (
            <button
                key={lane.key}
                type="button"
                onClick={() => onToggle(lane.key)}
                aria-pressed={active}
                className={`rounded-full px-4 py-2 font-display text-xs font-semibold uppercase tracking-wide transition-colors ${
                active ? 'bg-white text-navy-950' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
            >
                {lane.label}
            </button>
            )
        })}
        </div>
    )
    }

    export default LaneFilter