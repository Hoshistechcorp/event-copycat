import { useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlidersHorizontal, X } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { Vendor } from "@/hooks/useVendors";

export interface VendorFilters {
  city: string | null;
  minRating: number;
  maxPrice: number | null;
}

export const defaultVendorFilters: VendorFilters = {
  city: null,
  minRating: 0,
  maxPrice: null,
};

interface Props {
  vendors: Vendor[];
  filters: VendorFilters;
  onChange: (next: VendorFilters) => void;
}

const VendorFiltersPopover = ({ vendors, filters, onChange }: Props) => {
  const { formatPrice } = useCurrency();

  const cities = useMemo(() => {
    const set = new Set<string>();
    vendors.forEach((v) => v.city && set.add(v.city));
    return Array.from(set).sort();
  }, [vendors]);

  const priceCeiling = useMemo(() => {
    const max = vendors.reduce((acc, v) => Math.max(acc, Number(v.base_price) || 0), 0);
    return Math.max(50000, Math.ceil(max / 10000) * 10000);
  }, [vendors]);

  const activeCount =
    (filters.city ? 1 : 0) + (filters.minRating > 0 ? 1 : 0) + (filters.maxPrice !== null ? 1 : 0);

  const reset = () => onChange(defaultVendorFilters);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="h-12 rounded-xl font-bold text-muted-foreground relative"
        >
          <SlidersHorizontal className="h-4 w-4 mr-1.5" />
          <span className="hidden sm:inline">Filters</span>
          {activeCount > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
              {activeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 glass-panel border-border" align="end">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-extrabold text-sm">Refine vendors</h4>
          {activeCount > 0 && (
            <button
              onClick={reset}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>

        <div className="space-y-5">
          <div>
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
              City
            </Label>
            <Select
              value={filters.city ?? "__all"}
              onValueChange={(val) =>
                onChange({ ...filters, city: val === "__all" ? null : val })
              }
            >
              <SelectTrigger className="mt-2 h-10">
                <SelectValue placeholder="Any city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">Any city</SelectItem>
                {cities.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Minimum rating
              </Label>
              <span className="text-xs font-bold text-primary">
                {filters.minRating > 0 ? `${filters.minRating.toFixed(1)}★` : "Any"}
              </span>
            </div>
            <Slider
              className="mt-3"
              min={0}
              max={5}
              step={0.5}
              value={[filters.minRating]}
              onValueChange={([v]) => onChange({ ...filters, minRating: v })}
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Max starting price
              </Label>
              <span className="text-xs font-bold text-primary">
                {filters.maxPrice === null
                  ? "Any"
                  : `up to ${formatPrice(String(filters.maxPrice))}`}
              </span>
            </div>
            <Slider
              className="mt-3"
              min={0}
              max={priceCeiling}
              step={Math.max(1000, Math.round(priceCeiling / 50))}
              value={[filters.maxPrice ?? priceCeiling]}
              onValueChange={([v]) =>
                onChange({ ...filters, maxPrice: v >= priceCeiling ? null : v })
              }
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default VendorFiltersPopover;
