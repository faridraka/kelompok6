import { Empty } from '../../components/coach/ui'
import { PageHeader } from '../../components/player/ui'

// Temporary page so the nav link does not 404. Replaced one by one.
const CoachComingSoon = ({ title }) => (
  <>
    <PageHeader title={title} />
    <Empty>Coming soon</Empty>
  </>
)
export default CoachComingSoon
