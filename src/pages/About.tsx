import Navbar from "@/components/Navbar";
import FeaturesSection from "@/components/FeaturesSection";
import NeonPartySection from "@/components/NeonPartySection";
import NeonTestimonialsSection from "@/components/NeonTestimonialsSection";
import CreatorsSection from "@/components/CreatorsSection";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <FeaturesSection />
      <NeonPartySection />
      <NeonTestimonialsSection />
      <CreatorsSection />
      <Footer />
    </div>
  );
};

export default About;
