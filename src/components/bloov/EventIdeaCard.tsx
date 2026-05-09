import { motion } from "framer-motion";
import { Flame, MapPin, Users } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { EventIdea } from "@/hooks/useEventIdeas";

interface Props {
  idea: EventIdea;
}

const EventIdeaCard = ({ idea }: Props) => {
  const { formatPrice } = useCurrency();
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative rounded-2xl overflow-hidden bg-card border border-border min-w-[280px] sm:min-w-0"
    >
      <div className="relative aspect-[5/4] overflow-hidden">
        {idea.hero_image_url && (
          <img
            src={idea.hero_image_url}
            alt={idea.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-background/90 backdrop-blur text-[10px] font-bold">
          <Flame className="h-3 w-3 text-primary" /> {idea.trend_score}
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white text-lg font-extrabold leading-tight">{idea.title}</h3>
        </div>
      </div>
      <div className="p-4 space-y-2">
        {idea.concept && (
          <p className="text-xs text-muted-foreground line-clamp-2">{idea.concept}</p>
        )}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {idea.city}
          </span>
          {idea.est_attendance && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" /> {idea.est_attendance}
            </span>
          )}
        </div>
        {idea.est_ticket_price !== null && (
          <p className="text-xs font-bold text-primary">
            Ticket ~ {formatPrice(idea.est_ticket_price)}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default EventIdeaCard;
