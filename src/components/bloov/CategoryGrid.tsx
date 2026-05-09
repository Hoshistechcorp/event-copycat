import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { VendorCategory } from "@/hooks/useVendors";

interface Props {
  categories: VendorCategory[];
}

const CategoryGrid = ({ categories }: Props) => {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3">
      {categories.map((cat, i) => {
        const Icon = (cat.icon_name && (Icons as unknown as Record<string, LucideIcon>)[cat.icon_name]) ||
          Icons.Sparkles;
        return (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.03 }}
            whileHover={{ y: -4, scale: 1.02 }}
            onClick={() => navigate(`/bloov-service/category/${cat.slug}`)}
            className="group relative overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/40 p-5 text-left transition-colors"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Icon className="h-5 w-5" />
              </div>
              <p className="font-bold text-sm text-foreground">{cat.name}</p>
              {cat.description && (
                <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{cat.description}</p>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default CategoryGrid;
