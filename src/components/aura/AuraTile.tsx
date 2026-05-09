import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Pin, PinOff, Sparkles } from "lucide-react";
import type { AuraProduct } from "@/lib/auraProducts";
import { useState } from "react";

interface Props {
  product: AuraProduct;
  linked: boolean;
  pinned: boolean;
  onOpen: () => void;
  onTogglePin: () => void;
  draggable?: boolean;
  density?: "compact" | "comfortable";
}

const AuraTile = ({ product, linked, pinned, onOpen, onTogglePin, draggable = true, density = "comfortable" }: Props) => {
  const Icon = product.icon;
  const [hover, setHover] = useState(false);
  const sortable = useSortable({ id: product.id, disabled: !draggable });
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  };

  const isCompact = density === "compact";

  return (
    <div
      ref={sortable.setNodeRef}
      style={style}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative group"
    >
      <button
        type="button"
        onClick={onOpen}
        {...(draggable ? sortable.listeners : {})}
        {...(draggable ? sortable.attributes : {})}
        className={`relative w-full ${isCompact ? "min-h-[64px] aspect-square" : "min-h-[76px] aspect-[5/4]"} rounded-xl bg-card/60 backdrop-blur-sm border border-white/10 flex flex-col items-center justify-center gap-1 p-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-card hover:border-white/20 active:scale-95 ${linked ? `hover:${product.glow}` : "grayscale-[60%] opacity-70 hover:grayscale-0 hover:opacity-100"}`}
      >
        {/* Icon scales with tile width via percentage */}
        <Icon
          className={`${product.color} shrink-0`}
          style={{ width: isCompact ? "32%" : "30%", height: "auto", maxWidth: 36, minWidth: 18 }}
          strokeWidth={1.75}
        />
        <span
          className="font-bold text-foreground text-center leading-tight tracking-tight w-full truncate"
          style={{ fontSize: "clamp(9px, 2.6cqw, 12px)" }}
        >
          {product.name}
        </span>

        {!linked && !product.alwaysLinked && (
          <span className="absolute top-1 right-1 inline-flex items-center gap-0.5 px-1 py-px rounded-full bg-primary text-primary-foreground text-[7px] font-bold animate-pulse">
            <Sparkles className="h-1.5 w-1.5" />
          </span>
        )}
      </button>

      {linked && !product.alwaysLinked && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
          className={`absolute -top-1.5 -right-1.5 h-7 w-7 rounded-full bg-background border border-white/20 flex items-center justify-center transition-all ${pinned ? `${product.color} opacity-100` : "text-muted-foreground opacity-0 group-hover:opacity-100 focus:opacity-100"}`}
          title={pinned ? "Unpin from nav" : "Pin to nav"}
          aria-label={pinned ? "Unpin from nav" : "Pin to nav"}
        >
          {pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
        </button>
      )}
    </div>
  );
};

export default AuraTile;
