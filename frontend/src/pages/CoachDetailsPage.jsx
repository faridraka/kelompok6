import { useParams } from 'react-router'

import CoachDetails from '../components/coach-details/CoachDetails'

const CoachDetailsPage = () => {
  const { id } = useParams()

  return <CoachDetails coachId={id} />
}

export default CoachDetailsPage
