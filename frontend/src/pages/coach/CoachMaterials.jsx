import { useState } from 'react'
import { getCoachMaterials } from '../../api/coach'
import banner from '../../assets/coach/schedule-banner.webp'
import { MaterialCard, MaterialForm } from '../../components/coach/MaterialsSection'
import { Empty, btn } from '../../components/coach/ui'
import { Async, PageHeader, Pill } from '../../components/player/ui'
import { useAsync } from '../../hooks/useAsync'

const FILTERS = [['all', 'All'], ['guide', 'Champion guides'], ['fundamental', 'Fundamentals']]
const EMPTY = { all: 'No materials yet.', guide: 'No champion guides yet.', fundamental: 'No fundamentals yet.' }

const CoachMaterials = () => {
  const state = useAsync(getCoachMaterials)
  const [filter, setFilter] = useState('all')
  const [adding, setAdding] = useState(false)

  return (
    <>
      {/* Banner section: header, add button and filters sit on the map. It runs edge to edge and up under the nav; the card grid starts below it. */}
      <section className="relative isolate -mt-8 mx-[calc(50%-50vw)] md:min-h-[300px]">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-full overflow-hidden md:h-[300px]">
          <img src={banner} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-navy-950/50" />
          <div className="absolute inset-x-0 bottom-0 h-[130px] bg-gradient-to-t from-navy-950 to-transparent" />
        </div>
        <div className="mx-auto w-full max-w-[1650px] px-6 pb-6 pt-8 lg:px-8">
          <PageHeader title="Materials" sub="Learning content your players see. Upload a file and it appears on their Materials page." />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">{FILTERS.map(([k, l]) => <Pill key={k} active={filter === k} onClick={() => setFilter(k)}>{l}</Pill>)}</div>
            {!adding && <button type="button" onClick={() => setAdding(true)} className={btn}>Add material</button>}
          </div>
        </div>
      </section>

      {adding && <MaterialForm onDone={() => setAdding(false)} onSaved={state.reload} />}

      {/* Keep the grid on screen while it reloads after a save. */}
      <Async state={{ ...state, loading: state.loading && !state.data }}>
        {(items) => {
          const shown = items.filter((m) => filter === 'all' || m.type === filter)
          return !shown.length ? <Empty>{EMPTY[filter]}</Empty> : (
            <div className="grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
              {shown.map((m) => <MaterialCard key={m.id} m={m} />)}
            </div>
          )
        }}
      </Async>
    </>
  )
}
export default CoachMaterials
