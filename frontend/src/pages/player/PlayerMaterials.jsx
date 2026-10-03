import { useState } from 'react'
import { getMaterials } from '../../api/player'
import { useAsync } from '../../hooks/useAsync'
import { Async, Empty, PageHeader, Pill } from '../../components/player/ui'
import { FiChevronRight } from 'react-icons/fi'

const FILTERS = [['all', 'All'], ['guide', 'Champion guides'], ['fundamental', 'Fundamentals']]

const MaterialCard = ({ m }) => (
  <a href={m.link} target="_blank" rel="noopener noreferrer"
    className="group flex flex-col border border-white/10 bg-navy-900/70 p-5 transition-colors hover:border-cyan-glow/50 focus-visible:outline-2 focus-visible:outline-cyan-glow">
    {m.thumbnailUrl && <img src={m.thumbnailUrl} alt="" className="mb-4 aspect-video w-full object-cover" />}
    <p className="text-xs uppercase tracking-wide text-white/60">{m.tagline}</p>
    <h3 className="mt-2 font-display text-2xl font-bold uppercase leading-tight text-white">{m.title}</h3>
    {m.description && <p className="mt-3 text-sm leading-relaxed text-white/70">{m.description}</p>}
    <span className="mt-auto flex items-center gap-2 pt-6 text-sm font-semibold text-periwinkle-300 group-hover:text-cyan-glow">
      {m.type === 'guide' ? 'Start guide' : 'Start lesson'}
      <FiChevronRight className="h-3 w-2" aria-hidden="true" />
    </span>
  </a>
)

const PlayerMaterials = () => {
  const state = useAsync(getMaterials)
  const [filter, setFilter] = useState('all')
  return (
    <>
      <PageHeader title="Materials" sub="Guides and fundamentals from our coaches." />
      <div className="mb-8 flex flex-wrap gap-2">{FILTERS.map(([k, l]) => <Pill key={k} active={filter === k} onClick={() => setFilter(k)}>{l}</Pill>)}</div>
      <Async state={state}>
        {(items) => {
          const shown = items.filter((m) => filter === 'all' || m.type === filter)
          return shown.length ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{shown.map((m) => <MaterialCard key={m.id} m={m} />)}</div> : <Empty>Nothing here yet.</Empty>
        }}
      </Async>
    </>
  )
}
export default PlayerMaterials
