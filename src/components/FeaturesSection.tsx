import { motion } from "framer-motion";
import { Search, ShieldCheck, Zap, Users, Globe, Bell } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Discover Unique Events",
    description: "From secret rooftops to massive festivals, find experiences that match your vibe perfectly.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Ticketing",
    description: "Fraud-proof digital tickets with instant entry. Your safety and peace of mind are our priority.",
  },
  {
    icon: Zap,
    title: "Seamless Booking",
    description: "Book tickets in seconds. No long forms, no stress. Just pick, pay, and you're in.",
  },
  {
    icon: Users,
    title: "Built for Community",
    description: "See where your friends are going and build your own social event calendar.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Find events in major cities across Africa and beyond. We are where the culture is.",
  },
  {
    icon: Bell,
    title: "Instant Updates",
    description: "Get real-time notifications about event changes, guest list updates, and more.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 md:py-28">
      <div className="container px-4 md:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            Why iBLOOV?
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            We're redefining how you experience the world around you.
          </p>
        </div>

        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={item}
              className="group p-6 rounded-2xl bg-secondary/50 hover:bg-secondary border border-transparent hover:border-border transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
