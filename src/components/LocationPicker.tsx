import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { COUNTRIES } from "@/lib/countries";
import { cn } from "@/lib/utils";

interface Props {
  country: string;
  city: string;
  onChange: (next: { country: string; city: string }) => void;
  layout?: "row" | "stack";
  className?: string;
}

const LocationPicker = ({ country, city, onChange, layout = "row", className }: Props) => {
  const [openCountry, setOpenCountry] = useState(false);
  const [openCity, setOpenCity] = useState(false);
  const [cityQuery, setCityQuery] = useState("");

  const countryObj = useMemo(() => COUNTRIES.find((c) => c.name === country), [country]);
  const cityOptions = useMemo(() => {
    const base = countryObj ? countryObj.cities : COUNTRIES.flatMap((c) => c.cities);
    if (!cityQuery) return base.slice(0, 30);
    return base.filter((c) => c.toLowerCase().includes(cityQuery.toLowerCase())).slice(0, 30);
  }, [countryObj, cityQuery]);

  return (
    <div className={cn(layout === "row" ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : "space-y-3", className)}>
      {/* Country */}
      <Popover open={openCountry} onOpenChange={setOpenCountry}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" className="w-full justify-between rounded-xl h-11">
            {country ? (
              <span className="flex items-center gap-2">
                <span>{countryObj?.flag ?? "🌍"}</span> {country}
              </span>
            ) : (
              <span className="text-muted-foreground">Select country</span>
            )}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search country..." />
            <CommandList>
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {COUNTRIES.map((c) => (
                  <CommandItem
                    key={c.code}
                    value={c.name}
                    onSelect={() => {
                      onChange({ country: c.name, city: "" });
                      setOpenCountry(false);
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", country === c.name ? "opacity-100" : "opacity-0")} />
                    <span className="mr-2">{c.flag}</span> {c.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* City */}
      <Popover open={openCity} onOpenChange={setOpenCity}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" className="w-full justify-between rounded-xl h-11">
            <span className="flex items-center gap-2 truncate">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              {city || <span className="text-muted-foreground">Pick or type a city</span>}
            </span>
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput placeholder="Search city..." value={cityQuery} onValueChange={setCityQuery} />
            <CommandList>
              <CommandEmpty>
                <div className="p-3 space-y-2">
                  <p className="text-xs text-muted-foreground">No match. Use this name?</p>
                  <Input
                    placeholder="Type any city"
                    value={cityQuery}
                    onChange={(e) => setCityQuery(e.target.value)}
                  />
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      if (cityQuery.trim()) {
                        onChange({ country, city: cityQuery.trim() });
                        setOpenCity(false);
                      }
                    }}
                  >
                    Use "{cityQuery || '...'}"
                  </Button>
                </div>
              </CommandEmpty>
              <CommandGroup>
                {cityOptions.map((c) => (
                  <CommandItem
                    key={c}
                    value={c}
                    onSelect={() => {
                      onChange({ country, city: c });
                      setOpenCity(false);
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", city === c ? "opacity-100" : "opacity-0")} />
                    {c}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default LocationPicker;
