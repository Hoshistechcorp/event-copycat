import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Sparkles, LayoutGrid } from "lucide-react";
import type { VendorCategory } from "@/hooks/useVendors";
import { cn } from "@/lib/utils";

interface Props {
  categories: VendorCategory[];
  activeSlug: string | null;
  onSelect: (slug: string | null) => void;
}

const Chip = ({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
}) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={cn(
      "snap-start shrink-0 inline-flex items-center gap-1.5 h-10 px-4 rounded-full border text-xs font-bold transition-colors",
      active
        ? "glass-active border-primary/40 text-primary"
        : "glass-panel border-border text-muted-foreground hover:text-foreground",
    )}
  >
    <Icon className="h-3.5 w-3.5" />
    <span className="whitespace-nowrap">{label}</span>
  </motion.button>
);

const CategoryChipRow = ({ categories, activeSlug, onSelect }: Props) => {
  return (
    <div className="-mx-4 px-4 md:mx-0 md:px-0">
      <div className="flex md:flex-wrap gap-2 overflow-x-auto snap-x snap-mandatory pb-2 md:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Chip
          active={activeSlug === null}
          onClick={() => onSelect(null)}
          icon={LayoutGrid}
          label="All"
        />
        {categories.map((cat) => {
          const Icon =
            (cat.icon_name && (Icons as unknown as Record<string, LucideIcon>)[cat.icon_name]) ||
            Sparkles;
          return (
            <Chip
              key={cat.id}
              active={activeSlug === cat.slug}
              onClick={() => onSelect(cat.slug)}
              icon={Icon}
              label={cat.name}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CategoryChipRow;
