import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ctaCreateImg from "@/assets/cta-bloov-create.jpg";
import ctaServiceImg from "@/assets/cta-bloov-service.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />

      {/* CTA Cards — Bloov Create + Bloov Service */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-8">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
              NEW · BLOOV ECOSYSTEM
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-3 leading-tight">
              Two ways to make it happen.
            </h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Dream up the next viral event — or hire the team to execute it for you.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Bloov Create */}
            <motion.div
              className="group relative overflow-hidden rounded-[2rem] min-h-[360px] cursor-pointer ring-1 ring-border"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -6, scale: 1.02 }}
              onClick={() => navigate("/bloov-create")}
            >
              <img
                src={ctaCreateImg}
                alt="Bloov Create — design your event"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/70 via-black/50 to-transparent mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="relative z-10 flex flex-col justify-end h-full p-8">
                <span className="inline-block self-start px-3 py-1 rounded-lg bg-white/15 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider mb-3">
                  Bloov Create · Creators
                </span>
                <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-2 leading-tight">
                  Dream it. <br /> Launch it.
                </h3>
                <p className="text-white/80 text-sm leading-relaxed mb-5 max-w-[300px]">
                  Event idea engine, waitlist validation, and creator earnings — all in one flow.
                </p>
                <Button
                  size="lg"
                  className="self-start rounded-xl font-semibold"
                  onClick={(e) => { e.stopPropagation(); navigate("/bloov-create"); }}
                >
                  Open Bloov Create
                </Button>
              </div>
            </motion.div>

            {/* Bloov Service */}
            <motion.div
              className="group relative overflow-hidden rounded-[2rem] min-h-[360px] cursor-pointer ring-1 ring-border"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -6, scale: 1.02 }}
              onClick={() => navigate("/bloov-service")}
            >
              <img
                src={ctaServiceImg}
                alt="Bloov Service — hire the team"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-accent/60 via-black/50 to-transparent mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="relative z-10 flex flex-col justify-end h-full p-8">
                <span className="inline-block self-start px-3 py-1 rounded-lg bg-white/15 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider mb-3">
                  Bloov Service · Marketplace
                </span>
                <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-2 leading-tight">
                  Hire the <br /> dream team.
                </h3>
                <p className="text-white/80 text-sm leading-relaxed mb-5 max-w-[300px]">
                  Venues, planners, DJs, decor, traditional vendors — book everything in one place.
                </p>
                <Button
                  size="lg"
                  variant="secondary"
                  className="self-start rounded-xl font-semibold"
                  onClick={(e) => { e.stopPropagation(); navigate("/bloov-service"); }}
                >
                  Browse Marketplace
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
