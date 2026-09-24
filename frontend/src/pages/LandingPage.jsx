import CtaBanner from "../components/landing/CtaBanner";
import Hero from "../components/landing/Hero";
import HowItWorks from "../components/landing/HowItWorks";
import MapBackdrop from "../components/landing/MapBackdrop";
import Roles from "../components/landing/Roles";
import StatsBar from "../components/landing/StatsBar";

const LandingPage = () => {
  return (
    <>
      <Hero />
      <StatsBar />
      <MapBackdrop>
        <Roles />
        <HowItWorks />
        <CtaBanner />
      </MapBackdrop>
    </>
  );
};

export default LandingPage;
