import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tag, Plus, Trash2, Percent } from "lucide-react";

export interface PromoCode {
  code: string;
  discount_type: "percent" | "flat";
  value: string;
  max_uses: string;
}

interface Props {
  promoCodes: PromoCode[];
  onPromoChange: (p: PromoCode[]) => void;
  currencySymbol: string;
}

const PromoInvitesStep = ({ promoCodes, onPromoChange, currencySymbol }: Props) => {
  const add = () => onPromoChange([...promoCodes, { code: "", discount_type: "percent", value: "10", max_uses: "" }]);
  const remove = (i: number) => onPromoChange(promoCodes.filter((_, idx) => idx !== i));
  const update = <K extends keyof PromoCode>(i: number, k: K, v: PromoCode[K]) => {
    const u = [...promoCodes]; u[i] = { ...u[i], [k]: v }; onPromoChange(u);
  };

  return (
    <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Promo codes</h3>
          {promoCodes.length > 0 && <span className="text-xs text-muted-foreground">({promoCodes.length})</span>}
        </div>
        <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={add}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground">Buyers enter the code at checkout to get a discount.</p>

      {promoCodes.length === 0 ? (
        <div className="py-6 text-center text-xs text-muted-foreground">No promo codes — totally optional.</div>
      ) : (
        <div className="space-y-2">
          {promoCodes.map((p, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <Input value={p.code} onChange={(e) => update(i, "code", e.target.value.toUpperCase())} placeholder="CODE" className="col-span-4 rounded-lg h-9 bg-secondary border-border text-xs font-mono uppercase" maxLength={32} />
              <select value={p.discount_type} onChange={(e) => update(i, "discount_type", e.target.value as PromoCode["discount_type"])}
                className="col-span-3 h-9 rounded-lg bg-secondary border border-border px-2 text-xs">
                <option value="percent">% off</option>
                <option value="flat">{currencySymbol} off</option>
              </select>
              <div className="col-span-3 relative">
                {p.discount_type === "percent" ? <Percent className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" /> : <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{currencySymbol}</span>}
                <Input type="number" min="0" value={p.value} onChange={(e) => update(i, "value", e.target.value)} className="rounded-lg pl-7 h-9 bg-secondary border-border text-xs" />
              </div>
              <Input type="number" min="0" value={p.max_uses} onChange={(e) => update(i, "max_uses", e.target.value)} placeholder="Max" className="col-span-1 rounded-lg h-9 bg-secondary border-border text-xs" />
              <button type="button" onClick={() => remove(i)} className="col-span-1 text-destructive flex justify-center"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PromoInvitesStep;
