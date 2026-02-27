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
    <section id="nightlife" className="relative overflow-hidden bg-[hsl(224,30%,6%)] py-24 md:py-32">
      {/* Neon edge glow - top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(280,100%,60%)] to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[hsl(280,100%,60%)]/10 to-transparent pointer-events-none" />

      {/* Neon edge glow - bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(180,100%,50%)] to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[hsl(180,100%,50%)]/10 to-transparent pointer-events-none" />

      {/* Animated neon orbs - different colors, moving around */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full bg-[hsl(280,100%,60%)] opacity-[0.07] blur-[120px] pointer-events-none"
        animate={{
          x: ["-10%", "15%", "-5%"],
          y: ["-20%", "10%", "-15%"],
        }}
        transition={{ duration: 12, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        style={{ top: "5%", left: "10%" }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full bg-[hsl(180,100%,50%)] opacity-[0.08] blur-[100px] pointer-events-none"
        animate={{
          x: ["10%", "-15%", "5%"],
          y: ["15%", "-10%", "20%"],
        }}
        transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        style={{ bottom: "10%", right: "15%" }}
      />
      <motion.div
        className="absolute w-[350px] h-[350px] rounded-full bg-[hsl(320,100%,55%)] opacity-[0.06] blur-[90px] pointer-events-none"
        animate={{
          x: ["5%", "-10%", "8%"],
          y: ["-5%", "15%", "-10%"],
        }}
        transition={{ duration: 18, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        style={{ top: "40%", left: "50%" }}
      />
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full bg-[hsl(38,95%,55%)] opacity-[0.05] blur-[80px] pointer-events-none"
        animate={{
          x: ["-8%", "12%", "-6%"],
          y: ["10%", "-12%", "8%"],
        }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        style={{ top: "20%", right: "25%" }}
      />
      <motion.div
        className="absolute w-[250px] h-[250px] rounded-full bg-[hsl(140,80%,45%)] opacity-[0.05] blur-[70px] pointer-events-none"
        animate={{
          x: ["0%", "-8%", "6%"],
          y: ["-8%", "10%", "-5%"],
        }}
        transition={{ duration: 14, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        style={{ bottom: "25%", left: "30%" }}
      />

      {/* Side neon glows - animated */}
      <motion.div
        className="absolute top-1/3 left-0 w-24 h-[300px] bg-gradient-to-r from-[hsl(280,100%,60%)]/15 to-transparent pointer-events-none blur-[40px]"
        animate={{ opacity: [0.15, 0.25, 0.15], y: [-20, 20, -20] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/3 right-0 w-24 h-[300px] bg-gradient-to-l from-[hsl(180,100%,50%)]/15 to-transparent pointer-events-none blur-[40px]"
        animate={{ opacity: [0.15, 0.3, 0.15], y: [20, -20, 20] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

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
            <motion.span
              className="bg-clip-text text-transparent"
              animate={{
                backgroundImage: [
                  "linear-gradient(135deg, hsl(280,100%,70%), hsl(320,100%,65%), hsl(38,95%,55%))",
                  "linear-gradient(135deg, hsl(180,100%,60%), hsl(280,100%,70%), hsl(320,100%,65%))",
                  "linear-gradient(135deg, hsl(38,95%,55%), hsl(140,80%,50%), hsl(280,100%,70%))",
                  "linear-gradient(135deg, hsl(320,100%,65%), hsl(38,95%,55%), hsl(180,100%,60%))",
                  "linear-gradient(135deg, hsl(280,100%,70%), hsl(320,100%,65%), hsl(38,95%,55%))",
                ],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              style={{ filter: "drop-shadow(0 0 20px hsl(280 100% 60% / 0.5))" }}
            >
              comes alive
            </motion.span>
          </h2>
          <p className="text-[hsl(220,20%,60%)] text-lg max-w-lg mx-auto">
            From underground raves to rooftop soirées, iBLOOV powers the best nightlife across the continent.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {highlights.map((h, i) => {
            // Each card gets a different neon accent color
            const neonColors = [
              { from: "hsl(280,100%,60%)", to: "hsl(320,100%,65%)", icon: "hsl(280,80%,70%)" },
              { from: "hsl(180,100%,50%)", to: "hsl(200,100%,60%)", icon: "hsl(180,90%,65%)" },
              { from: "hsl(38,95%,55%)", to: "hsl(25,100%,60%)", icon: "hsl(38,90%,65%)" },
              { from: "hsl(140,80%,45%)", to: "hsl(160,90%,50%)", icon: "hsl(140,80%,60%)" },
            ];
            const color = neonColors[i % neonColors.length];

            return (
              <motion.div
                key={h.label}
                className="group relative p-6 rounded-2xl bg-white/[0.04] backdrop-blur-sm transition-all duration-500 overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{ border: `1px solid rgba(255,255,255,0.08)` }}
                whileHover={{
                  borderColor: `${color.from}66`,
                  boxShadow: `0 0 30px ${color.from}1a, inset 0 0 30px ${color.from}08`,
                }}
              >
                {/* Animated neon gradient overlay on hover */}
                <motion.div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  style={{
                    background: `linear-gradient(135deg, ${color.from}14 0%, transparent 50%, ${color.to}0a 100%)`,
                  }}
                />
                {/* Animated top edge neon line */}
                <motion.div
                  className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${color.from}, transparent)`,
                    opacity: 0,
                  }}
                  whileHover={{ opacity: 0.6 }}
                  transition={{ duration: 0.5 }}
                />
                <div className="relative z-10">
                  <motion.div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-shadow duration-500"
                    style={{
                      background: `linear-gradient(135deg, ${color.from}33, ${color.to}33)`,
                    }}
                    whileHover={{
                      boxShadow: `0 0 25px ${color.from}4d`,
                    }}
                  >
                    <h.icon className="w-6 h-6" style={{ color: color.icon }} />
                  </motion.div>
                  <h3 className="text-lg font-bold text-white mb-1">{h.label}</h3>
                  <p className="text-sm text-[hsl(220,20%,55%)]">{h.desc}</p>
                </div>
              </motion.div>
            );
          })}
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
            asChild
          >
            <a href="#events">Explore Nightlife Events</a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default NeonPartySection;
