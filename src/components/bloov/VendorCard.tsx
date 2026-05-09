import { motion } from "framer-motion";
import { Star, MapPin, BadgeCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { Vendor } from "@/hooks/useVendors";

interface Props {
  vendor: Vendor;
}

const VendorCard = ({ vendor }: Props) => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  return (
    <motion.button
      whileHover={{ y: -4 }}
      onClick={() => navigate(`/bloov-service/vendors/${vendor.id}`)}
      className="group relative text-left rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/40 transition-colors w-full"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        {vendor.cover_url && (
          <img
            src={vendor.cover_url}
            alt={vendor.business_name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        )}
        {vendor.is_verified && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-background/90 backdrop-blur text-[10px] font-bold">
            <BadgeCheck className="h-3 w-3 text-primary" /> Verified
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-foreground text-sm line-clamp-1">{vendor.business_name}</h3>
          <div className="flex items-center gap-1 text-xs">
            <Star className="h-3 w-3 fill-primary text-primary" />
            <span className="font-semibold">{vendor.rating.toFixed(1)}</span>
          </div>
        </div>
        {vendor.tagline && (
          <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{vendor.tagline}</p>
        )}
        <div className="flex items-center justify-between">
          {vendor.city && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <MapPin className="h-3 w-3" /> {vendor.city}
            </span>
          )}
          <span className="text-xs font-bold text-primary">
            from {formatPrice(vendor.base_price)}
          </span>
        </div>
      </div>
    </motion.button>
  );
};

export default VendorCard;
