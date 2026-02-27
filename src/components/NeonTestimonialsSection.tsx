import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Chioma A.",
    role: "Event Organizer, Lagos",
    quote: "iBLOOV made my first event seamless. Sold 500 tickets in 3 days!",
    rating: 5,
  },
  {
    name: "Kwame B.",
    role: "DJ & Promoter, Accra",
    quote: "The platform is a game-changer for nightlife in West Africa. Period.",
    rating: 5,
  },
  {
    name: "Amara K.",
    role: "Festival-goer, Nairobi",
    quote: "I discover the best events through iBLOOV. My weekends are never boring!",
    rating: 5,
  },
];

const NeonTestimonialsSection = () => {
  return (
    <section className="relative overflow-hidden bg-[hsl(224,30%,5%)] py-24 md:py-32">
      {/* Neon orbs */}
      <div className="absolute top-1/3 right-0 w-[350px] h-[350px] rounded-full bg-[hsl(180,100%,50%)] opacity-[0.06] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[hsl(320,100%,60%)] opacity-[0.05] blur-[120px] pointer-events-none" />

      <div className="container px-4 md:px-8 relative z-10">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
            Loved by the{" "}
            <span className="bg-gradient-to-r from-[hsl(180,100%,60%)] to-[hsl(280,100%,70%)] bg-clip-text text-transparent">
              culture
            </span>
          </h2>
          <p className="text-[hsl(220,20%,55%)] text-lg">
            Hear what the community has to say.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className="p-6 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm hover:border-[hsl(180,100%,50%)]/20 transition-all duration-500"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-[hsl(38,95%,55%)] text-[hsl(38,95%,55%)]" />
                ))}
              </div>
              <p className="text-white/80 text-sm leading-relaxed mb-5">"{t.quote}"</p>
              <div>
                <p className="text-white font-semibold text-sm">{t.name}</p>
                <p className="text-[hsl(220,20%,50%)] text-xs">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NeonTestimonialsSection;
