import { motion } from "framer-motion";
import { Users, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { EventPackage } from "@/hooks/usePackages";

interface Props {
  pkg: EventPackage;
}

const PackageCard = ({ pkg }: Props) => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  return (
    <motion.button
      whileHover={{ y: -6 }}
      onClick={() => navigate(`/bloov-service/packages/${pkg.slug}`)}
      className="group relative text-left rounded-3xl overflow-hidden min-h-[360px] w-full"
    >
      {pkg.hero_image_url && (
        <img
          src={pkg.hero_image_url}
          alt={pkg.title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      <div className="relative z-10 flex flex-col justify-end h-full p-6 min-h-[360px]">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-1 rounded-full bg-primary/90 text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
            {pkg.category}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur text-white text-[10px] font-semibold flex items-center gap-1">
            <Users className="h-3 w-3" /> {pkg.guest_capacity} guests
          </span>
        </div>
        <h3 className="text-2xl font-extrabold text-white mb-1.5 leading-tight">{pkg.title}</h3>
        <p className="text-white/80 text-sm line-clamp-2 mb-4">{pkg.description}</p>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-white/60 text-[10px] uppercase tracking-wider font-semibold">From</p>
            <p className="text-white text-xl font-extrabold">{formatPrice(String(pkg.base_price))}</p>
          </div>
          <span className="flex items-center gap-1 text-white/90 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" /> {pkg.included_vendor_categories.length} services
          </span>
        </div>
      </div>
    </motion.button>
  );
};

export default PackageCard;
