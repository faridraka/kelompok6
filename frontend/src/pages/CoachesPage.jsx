    import { useMemo, useState, useEffect } from 'react'
    import { useSearchParams } from 'react-router'

    import { generateCoaches } from '../data/coaches'
    import CoachCard from '../components/coaches/CoachCard'
    import LaneFilter from '../components/coaches/LaneFilter'

    const SearchIcon = () => (
    <svg viewBox="0 0 20 20" className="h-4 w-4 text-white/50" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <circle cx="9" cy="9" r="6.5" />
        <path d="M18 18l-4.3-4.3" strokeLinecap="round" />
    </svg>
    )

    const ALL_COACHES = generateCoaches(9)

    const CoachesPage = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [query, setQuery] = useState('')

    const [selectedLanes, setSelectedLanes] = useState(() => {
        const initial = searchParams.get('role')
        return new Set(initial ? initial.split(',').filter(Boolean) : [])
    })

    useEffect(() => {
        const next = new URLSearchParams(searchParams)
        if (selectedLanes.size > 0) {
        next.set('role', [...selectedLanes].join(','))
        } else {
        next.delete('role')
        }
        setSearchParams(next, { replace: true })
    }, [selectedLanes])

    const toggleLane = (laneKey) => {
        if (laneKey === null) {
        setSelectedLanes(new Set())
        return
        }
        setSelectedLanes((prev) => {
        const next = new Set(prev)
        next.has(laneKey) ? next.delete(laneKey) : next.add(laneKey)
        return next
        })
    }

    const filteredCoaches = useMemo(() => {
        const q = query.trim().toLowerCase()
        return ALL_COACHES.filter((coach) => {
        const laneMatch = selectedLanes.size === 0 || coach.lanes.some((l) => selectedLanes.has(l))
        const queryMatch =
            q === '' ||
            coach.name.toLowerCase().includes(q) ||
            coach.academyLabel.toLowerCase().includes(q) ||
            coach.mainHero.toLowerCase().includes(q)
        return laneMatch && queryMatch
        })
    }, [query, selectedLanes])

    return (
        <div className="mx-auto max-w-[1650px] px-6 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
            <p className="font-display text-xs font-medium uppercase tracking-[0.26em] text-gold-400 sm:text-sm">
            Find your coach
            </p>
            <h1 className="mt-4 font-display text-3xl font-bold uppercase leading-tight text-white sm:text-4xl lg:text-5xl">
            All available coaches
            </h1>
        </div>

        <div className="mx-auto mt-10 flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <LaneFilter selected={selectedLanes} onToggle={toggleLane} />

            <div className="relative w-full sm:w-64">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <SearchIcon />
            </span>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search coaches..."
                className="w-full border border-white/15 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-white/40 focus:border-cyan-glow focus:outline-none"
            />
            </div>
        </div>

        {filteredCoaches.length > 0 ? (
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCoaches.map((coach) => (
                <CoachCard key={coach.id} coach={coach} />
            ))}
            </div>
        ) : (
            <p className="mt-16 text-center text-white/60">No coaches match your filters right now.</p>
        )}
        </div>
    )
    }

    export default CoachesPage