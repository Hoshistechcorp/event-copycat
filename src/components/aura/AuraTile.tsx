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
}

const AuraTile = ({ product, linked, pinned, onOpen, onTogglePin, draggable = true }: Props) => {
  const Icon = product.icon;
  const [hover, setHover] = useState(false);
  const sortable = useSortable({ id: product.id, disabled: !draggable });
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  };

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
        className={`relative w-full aspect-square rounded-2xl bg-card/60 backdrop-blur-sm border border-white/10 flex flex-col items-center justify-center gap-2 p-3 transition-all duration-200 hover:-translate-y-1 hover:bg-card ${linked ? `hover:${product.glow}` : "grayscale-[60%] opacity-70 hover:grayscale-0 hover:opacity-100"}`}
      >
        <Icon className={`h-7 w-7 ${product.color}`} />
        <span className="text-[11px] font-bold text-foreground text-center leading-tight">{product.name}</span>

        {!linked && !product.alwaysLinked && (
          <span className="absolute top-1.5 right-1.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[8px] font-bold animate-pulse">
            <Sparkles className="h-2 w-2" /> Set Up
          </span>
        )}
      </button>

      {linked && !product.alwaysLinked && hover && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
          className={`absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-background border border-white/20 flex items-center justify-center transition-colors ${pinned ? product.color : "text-muted-foreground hover:text-foreground"}`}
          title={pinned ? "Unpin from nav" : "Pin to nav"}
        >
          {pinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
        </button>
      )}
    </div>
  );
};

export default AuraTile;
