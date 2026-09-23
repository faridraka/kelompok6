import Navbar from '../components/Navbar'
import Hero from '../components/landing/Hero'
import StatsBar from '../components/landing/StatsBar'
import MapBackdrop from '../components/landing/MapBackdrop'
import Roles from '../components/landing/Roles'
import HowItWorks from '../components/landing/HowItWorks'

const LandingPage = () => {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <MapBackdrop>
          <Roles />
          <HowItWorks />
        </MapBackdrop>
      </main>
    </>
  )
}

export default LandingPage
