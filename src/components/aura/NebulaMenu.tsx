import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Grid3x3, Search, Sparkles, LayoutGrid, Rows3 } from "lucide-react";
import { AURA_PRODUCTS, type AuraProduct } from "@/lib/auraProducts";
import { useAuraLinks } from "@/hooks/useAuraLinks";
import { useAuth } from "@/contexts/AuthContext";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import AuraTile from "./AuraTile";
import AuraSetupDialog from "./AuraSetupDialog";
import { toast } from "@/hooks/use-toast";

type Density = "compact" | "comfortable";

const NebulaMenu = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: links = [], isLinked, pinnedIds, link, unlink, togglePin, reorder } = useAuraLinks();
  const [search, setSearch] = useState("");
  const [setupProduct, setSetupProduct] = useState<AuraProduct | null>(null);
  const [open, setOpen] = useState(false);
  const [density, setDensity] = useState<Density>(() => (typeof window !== "undefined" && (localStorage.getItem("aura-density") as Density)) || "comfortable");

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("aura-density", density);
  }, [density]);

  // Order: user-customized order first, then unlinked products by default order
  const orderedProducts = useMemo(() => {
    const order = links.map((l) => l.product_id);
    const linkedFirst = order.map((id) => AURA_PRODUCTS.find((p) => p.id === id)).filter(Boolean) as AuraProduct[];
    const rest = AURA_PRODUCTS.filter((p) => !order.includes(p.id) && !p.alwaysLinked);
    const auralink = AURA_PRODUCTS.find((p) => p.alwaysLinked)!;
    // AuraLink always pinned first
    const sequence = [auralink, ...linkedFirst.filter((p) => !p.alwaysLinked), ...rest];
    if (!search) return sequence;
    const q = search.toLowerCase();
    return sequence.filter((p) => p.name.toLowerCase().includes(q) || p.tagline.toLowerCase().includes(q));
  }, [links, search]);

  const handleTileClick = (p: AuraProduct) => {
    if (p.alwaysLinked || isLinked(p.id)) {
      setOpen(false);
      navigate(p.route);
    } else {
      setSetupProduct(p);
    }
  };

  const handleTogglePin = async (p: AuraProduct) => {
    const currentlyPinned = pinnedIds.includes(p.id);
    if (!currentlyPinned && pinnedIds.length >= 3) {
      toast({ title: "Pin limit reached", description: "You can pin up to 3 apps to your nav.", variant: "destructive" });
      return;
    }
    await togglePin.mutateAsync({ productId: p.id, pinned: !currentlyPinned });
  };

  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    const ids = orderedProducts.filter((p) => !p.alwaysLinked).map((p) => p.id);
    const oldIdx = ids.indexOf(String(e.active.id));
    const newIdx = ids.indexOf(String(e.over.id));
    if (oldIdx < 0 || newIdx < 0) return;
    const next = arrayMove(ids, oldIdx, newIdx);
    // Only persist for linked items
    const linkedNext = next.filter((id) => isLinked(id));
    reorder.mutate(linkedNext);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full hover:bg-secondary" aria-label="Open iBloov apps">
            <Grid3x3 className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={8}
          className="w-[92vw] max-w-[520px] p-0 bg-background/70 backdrop-blur-xl border-white/10 shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden"
        >
          {/* Sticky header */}
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-white/5 px-3 py-2.5 sm:px-5 sm:py-4">
            <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
                <h3 className="text-sm sm:text-base font-extrabold tracking-tight truncate">Your iBloov Orbit</h3>
              </div>
              <div className="flex items-center gap-0.5 rounded-full bg-secondary/60 p-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setDensity("comfortable")}
                  className={`h-7 w-7 rounded-full flex items-center justify-center transition-colors ${density === "comfortable" ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  title="Comfortable"
                  aria-label="Comfortable density"
                >
                  <Rows3 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDensity("compact")}
                  className={`h-7 w-7 rounded-full flex items-center justify-center transition-colors ${density === "compact" ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  title="Compact"
                  aria-label="Compact density"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search apps…"
                className="pl-9 h-9 bg-secondary/50 border-white/5 text-xs rounded-xl"
              />
            </div>
          </div>

          {!user ? (
            <div className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-3">Sign in to sync your iBloov apps.</p>
              <Button size="sm" onClick={() => { setOpen(false); navigate("/signin"); }}>Sign in</Button>
            </div>
          ) : (
            <>
              <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={orderedProducts.filter((p) => !p.alwaysLinked).map((p) => p.id)} strategy={rectSortingStrategy}>
                  <div
                    className={`grid ${density === "compact" ? "grid-cols-4 gap-1.5 sm:gap-2 p-2 sm:p-3" : "grid-cols-3 gap-2 sm:gap-3 p-2.5 sm:p-4"} [container-type:inline-size]`}
                  >
                    {orderedProducts.map((p) => (
                      <AuraTile
                        key={p.id}
                        product={p}
                        linked={p.alwaysLinked || isLinked(p.id)}
                        pinned={pinnedIds.includes(p.id)}
                        onOpen={() => handleTileClick(p)}
                        onTogglePin={() => handleTogglePin(p)}
                        draggable={!p.alwaysLinked}
                        density={density}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              {orderedProducts.length === 0 && (
                <div className="p-6 text-center text-xs text-muted-foreground">No apps match "{search}"</div>
              )}
              <div className="px-4 py-3 border-t border-white/5 text-[10px] text-muted-foreground">
                Drag tiles to reorder · Hover a linked tile to pin it to your nav
              </div>
            </>
          )}
        </PopoverContent>
      </Popover>

      <AuraSetupDialog product={setupProduct} open={!!setupProduct} onOpenChange={(v) => !v && setSetupProduct(null)} />
    </>
  );
};

export default NebulaMenu;
