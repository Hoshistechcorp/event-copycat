import { motion } from "framer-motion";
import { Music, Sparkles, PartyPopper, Mic2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const highlights = [
  { icon: Music, label: "Live DJs", desc: "Top Afrobeat & Amapiano DJs every weekend" },
  { icon: Sparkles, label: "VIP Access", desc: "Exclusive backstage & lounge experiences" },
  { icon: PartyPopper, label: "Festival Vibes", desc: "Multi-stage festivals across Africa" },
  { icon: Mic2, label: "Live Performers", desc: "Your favourite artists, up close" },
];

const NeonPartySection = () => {
  return (
    <section className="relative overflow-hidden bg-[hsl(224,30%,6%)] py-24 md:py-32">
      {/* Neon edge glow - top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(280,100%,60%)] to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[hsl(280,100%,60%)]/10 to-transparent pointer-events-none" />

      {/* Neon edge glow - bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(180,100%,50%)] to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[hsl(180,100%,50%)]/10 to-transparent pointer-events-none" />

      {/* Neon glow orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[hsl(280,100%,60%)] opacity-[0.08] blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-[hsl(180,100%,50%)] opacity-[0.1] blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-[hsl(38,95%,55%)] opacity-[0.07] blur-[80px] pointer-events-none" />

      {/* Side neon glows */}
      <div className="absolute top-1/3 left-0 w-24 h-[300px] bg-gradient-to-r from-[hsl(280,100%,60%)]/15 to-transparent pointer-events-none blur-[40px]" />
      <div className="absolute bottom-1/3 right-0 w-24 h-[300px] bg-gradient-to-l from-[hsl(180,100%,50%)]/15 to-transparent pointer-events-none blur-[40px]" />

      <div className="container px-4 md:px-8 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-6 bg-[hsl(280,80%,60%)]/15 text-[hsl(280,80%,70%)] border border-[hsl(280,80%,60%)]/20 shadow-[0_0_15px_hsl(280,100%,60%,0.15)]">
            ✨ Nightlife & Party Scene
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            Where the night{" "}
            <span className="bg-gradient-to-r from-[hsl(280,100%,70%)] via-[hsl(320,100%,65%)] to-[hsl(38,95%,55%)] bg-clip-text text-transparent drop-shadow-[0_0_20px_hsl(280,100%,60%,0.5)]">
              comes alive
            </span>
          </h2>
          <p className="text-[hsl(220,20%,60%)] text-lg max-w-lg mx-auto">
            From underground raves to rooftop soirées, iBLOOV powers the best nightlife across the continent.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {highlights.map((h, i) => (
            <motion.div
              key={h.label}
              className="group relative p-6 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm hover:border-[hsl(280,80%,60%)]/40 transition-all duration-500 hover:shadow-[0_0_30px_hsl(280,100%,60%,0.1)]"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[hsl(280,100%,60%)]/0 to-[hsl(180,100%,50%)]/0 group-hover:from-[hsl(280,100%,60%)]/8 group-hover:to-[hsl(180,100%,50%)]/5 transition-all duration-500 pointer-events-none" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(280,80%,60%)]/20 to-[hsl(320,100%,65%)]/20 flex items-center justify-center mb-4 group-hover:shadow-[0_0_25px_hsl(280,100%,60%,0.3)] transition-shadow duration-500">
                  <h.icon className="w-6 h-6 text-[hsl(280,80%,70%)]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{h.label}</h3>
                <p className="text-sm text-[hsl(220,20%,55%)]">{h.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Button
            size="lg"
            className="rounded-full px-10 font-semibold text-base bg-gradient-to-r from-[hsl(280,80%,60%)] to-[hsl(320,100%,65%)] hover:from-[hsl(280,80%,55%)] hover:to-[hsl(320,100%,60%)] text-white border-0 shadow-[0_0_40px_hsl(280,100%,60%,0.35)]"
          >
            Explore Nightlife Events
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default NeonPartySection;
