import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import EventsSection from "@/components/EventsSection";
import NeonPartySection from "@/components/NeonPartySection";
import NeonTestimonialsSection from "@/components/NeonTestimonialsSection";
import CreatorsSection from "@/components/CreatorsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <EventsSection />
      <NeonPartySection />
      <NeonTestimonialsSection />
      <CreatorsSection />
      <Footer />
    </div>
  );
};

export default Index;
