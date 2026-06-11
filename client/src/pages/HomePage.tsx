import HeroSection from '../components/home/HeroSection';
import FeaturedListings from '../components/home/FeaturedListings';
import AreaCards from '../components/home/AreaCards';
import HowItWorks from '../components/home/HowItWorks';
import TrustSection from '../components/home/TrustSection';
import LandlordCTA from '../components/home/LandlordCTA';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedListings />
      <AreaCards />
      <HowItWorks />
      <TrustSection />
      <LandlordCTA />
    </>
  );
}
