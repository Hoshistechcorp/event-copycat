import Navbar from "@/components/Navbar";
import FeaturesSection from "@/components/FeaturesSection";
import NeonPartySection from "@/components/NeonPartySection";
import NeonTestimonialsSection from "@/components/NeonTestimonialsSection";
import CreatorsSection from "@/components/CreatorsSection";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Users, Globe, Zap, Heart } from "lucide-react";
import aboutHeroImg from "@/assets/about-hero.jpg";

const stats = [
  { label: "Events Hosted", value: "10K+", icon: Zap },
  { label: "Happy Attendees", value: "500K+", icon: Heart },
  { label: "Cities", value: "120+", icon: Globe },
  { label: "Creators", value: "5K+", icon: Users },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <img
          src={aboutHeroImg}
          alt="iBLOOV community"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-background" />

        <div className="relative z-10 container px-4 text-center py-32">
          <motion.span
            className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary-foreground text-sm font-semibold mb-6 backdrop-blur-sm border border-primary/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Our Story
          </motion.span>

          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            We're Building the Future
            <br />
            <span className="text-gradient-accent">of Live Experiences</span>
          </motion.h1>

          <motion.p
            className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            iBLOOV empowers creators to launch unforgettable events and connects
            people to the experiences that move them.
          </motion.p>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="backdrop-blur-md bg-white/10 border border-white/15 rounded-2xl p-5 text-center"
              >
                <stat.icon className="w-5 h-5 text-accent mx-auto mb-2" />
                <p className="text-2xl md:text-3xl font-extrabold text-white">
                  {stat.value}
                </p>
                <p className="text-white/60 text-xs font-medium mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 md:py-28">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2
              className="text-3xl md:text-4xl font-extrabold text-foreground mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Why iBLOOV?
            </motion.h2>
            <motion.p
              className="text-muted-foreground text-lg md:text-xl leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              We believe every creator deserves a platform that puts them first — not
              algorithms, not gatekeepers. iBLOOV strips away the noise so you can
              focus on what matters: crafting moments that people will never forget.
            </motion.p>
          </div>
        </div>
      </section>

      <FeaturesSection />
      <NeonPartySection />
      <NeonTestimonialsSection />
      <CreatorsSection />
      <Footer />
    </div>
  );
};

export default About;
