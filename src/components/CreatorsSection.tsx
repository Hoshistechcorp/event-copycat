import { motion } from "framer-motion";
import { Rocket, Banknote, BarChart3 } from "lucide-react";

const perks = [
  {
    icon: Rocket,
    title: "Launch in 5 minutes",
    description: "Fastest setup in the market. Focus on the vibes, not the tech.",
  },
  {
    icon: Banknote,
    title: "Instant Payouts",
    description: "Direct settlements to Flex-it or your bank account.",
  },
  {
    icon: BarChart3,
    title: "Own your data",
    description: "Detailed guest insights and direct marketing control.",
  },
];

const CreatorsSection = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container px-4 md:px-8">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            Built for creators,{" "}
            <br className="hidden sm:block" />
            not for ticket sellers.
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Take full control of your events. From guest lists to detailed
            analytics, we give you the tools to host unforgettable experiences.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {perks.map((p, i) => (
            <motion.div
              key={p.title}
              className="text-center"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <div className="w-14 h-14 rounded-2xl bg-accent/15 flex items-center justify-center mx-auto mb-4">
                <p.icon className="w-6 h-6 text-accent" />
              </div>
              <h4 className="font-bold text-foreground mb-2">{p.title}</h4>
              <p className="text-sm text-muted-foreground">{p.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CreatorsSection;
