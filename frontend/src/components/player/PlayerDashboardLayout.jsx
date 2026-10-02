import { Outlet } from 'react-router'
import PlayerSidebar from './PlayerSidebar'

const PlayerDashboardLayout = () => {
  return (
    <div className="min-h-dvh bg-navy-950 text-white">
      <PlayerSidebar />

      {/* pt-16 = tinggi header mobile */}
      <main className="pt-16 lg:pl-[280px] lg:pt-0">
        <Outlet />
      </main>
    </div>
  )
}

export default PlayerDashboardLayout
