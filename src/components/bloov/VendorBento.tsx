import { motion } from "framer-motion";
import { BadgeCheck, MapPin, Star, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "@/contexts/CurrencyContext";
import VendorCard from "./VendorCard";
import type { Vendor } from "@/hooks/useVendors";
import { cn } from "@/lib/utils";

interface Props {
  vendors: Vendor[];
}

const HeroVendor = ({
  vendor,
  tall = false,
  className,
}: {
  vendor: Vendor;
  tall?: boolean;
  className?: string;
}) => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  return (
    <motion.button
      whileHover={{ y: -4 }}
      onClick={() => navigate(`/bloov-service/vendors/${vendor.id}`)}
      className={cn(
        "group relative text-left rounded-3xl overflow-hidden glass-panel hover:border-primary/40 transition-colors",
        className,
      )}
    >
      <div className={cn("absolute inset-0 bg-secondary", tall ? "" : "")}>
        {vendor.cover_url && (
          <img
            src={vendor.cover_url}
            alt={vendor.business_name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
      </div>

      <div className="relative h-full flex flex-col justify-between p-5 md:p-6 min-h-[280px]">
        <div className="flex items-start justify-between gap-2">
          {vendor.is_verified && (
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-background/80 backdrop-blur text-[10px] font-bold">
              <BadgeCheck className="h-3 w-3 text-primary" /> Verified
            </div>
          )}
          <div className="ml-auto inline-flex items-center gap-1 px-2 py-1 rounded-full bg-background/80 backdrop-blur text-[11px] font-bold">
            <Star className="h-3 w-3 fill-primary text-primary" />
            {vendor.rating.toFixed(1)}
          </div>
        </div>

        <div>
          <h3 className="text-xl md:text-2xl font-extrabold text-foreground line-clamp-2">
            {vendor.business_name}
          </h3>
          {vendor.tagline && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{vendor.tagline}</p>
          )}
          <div className="flex items-center justify-between mt-3">
            {vendor.city && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" /> {vendor.city}
              </span>
            )}
            <span className="text-sm font-bold text-primary">
              from {formatPrice(String(vendor.base_price))}
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
};

const CustomCta = () => {
  const navigate = useNavigate();
  return (
    <motion.button
      whileHover={{ y: -4 }}
      onClick={() => navigate("/contact")}
      className="text-left rounded-3xl glass-panel glass-active p-5 md:p-6 flex flex-col justify-between min-h-[180px]"
    >
      <div className="h-10 w-10 rounded-xl btn-gradient-brand flex items-center justify-center text-primary-foreground">
        <Sparkles className="h-5 w-5" />
      </div>
      <div>
        <h3 className="text-lg font-extrabold text-foreground">Can't find the right fit?</h3>
        <p className="text-xs text-muted-foreground mt-1 mb-3">
          Tell us your event and we'll curate a custom package for you.
        </p>
        <span className="inline-flex items-center gap-1 text-sm font-bold text-primary">
          Request a custom package <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </motion.button>
  );
};

const VendorBento = ({ vendors }: Props) => {
  // Fallback: simple grid when there's not enough to fill the bento
  if (vendors.length < 5) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {vendors.map((v) => (
          <VendorCard key={v.id} vendor={v} />
        ))}
        {vendors.length > 0 && (
          <div className="col-span-2 md:col-span-1">
            <CustomCta />
          </div>
        )}
      </div>
    );
  }

  const [hero, second, third, tall, fifth] = vendors;

  return (
    <>
      {/* Mobile / tablet: standard grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:hidden">
        {vendors.slice(0, 6).map((v) => (
          <VendorCard key={v.id} vendor={v} />
        ))}
        <div className="col-span-2 md:col-span-3">
          <CustomCta />
        </div>
      </div>

      {/* Desktop bento */}
      <div className="hidden lg:grid grid-cols-12 grid-rows-2 gap-4 auto-rows-[280px]">
        <HeroVendor vendor={hero} className="col-span-6 row-span-2" />
        <div className="col-span-3 row-span-1">
          <VendorCard vendor={second} />
        </div>
        <div className="col-span-3 row-span-1">
          <VendorCard vendor={third} />
        </div>
        <HeroVendor vendor={tall} tall className="col-span-3 row-span-1" />
        <div className="col-span-3 row-span-1">
          {vendors[5] ? <VendorCard vendor={vendors[5]} /> : <CustomCta />}
        </div>
        <div className="col-span-3 row-span-1 lg:col-start-7">
          <VendorCard vendor={fifth} />
        </div>
        <div className="col-span-3 row-span-1">
          <CustomCta />
        </div>
      </div>
    </>
  );
};

export default VendorBento;
