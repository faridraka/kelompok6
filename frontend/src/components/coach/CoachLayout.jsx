import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import CoachBackdrop from './CoachBackdrop'
import CoachTopNav from './CoachTopNav'
import Footer from '../Footer'
import { getSession } from '../../utils/session'

const CoachLayout = () => {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname]) // each coach page opens at the top
  if (getSession()?.accountType !== 'coach') return <Navigate to="/login" replace />

  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-x-clip bg-navy-950">
      <CoachBackdrop />
      <CoachTopNav />
      <main className="mx-auto w-full max-w-[1650px] flex-1 px-6 py-8 lg:px-8"><Outlet /></main>
      <Footer />
    </div>
  )
}
export default CoachLayout
