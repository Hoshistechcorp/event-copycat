import { createContext, useContext, useState, ReactNode } from "react";

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number; // rate relative to NGN (base)
}

export const currencies: Currency[] = [
  { code: "NGN", symbol: "₦", name: "Nigerian Naira", rate: 1 },
  { code: "USD", symbol: "$", name: "US Dollar", rate: 0.00062 },
  { code: "GBP", symbol: "£", name: "British Pound", rate: 0.00049 },
  { code: "EUR", symbol: "€", name: "Euro", rate: 0.00057 },
  { code: "GHS", symbol: "GH₵", name: "Ghanaian Cedi", rate: 0.0093 },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling", rate: 0.08 },
];

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (priceStr: string) => string;
  convertAmount: (ngnAmount: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<Currency>(currencies[0]);

  const convertAmount = (ngnAmount: number): number => {
    return Math.round(ngnAmount * currency.rate * 100) / 100;
  };

  const formatPrice = (priceStr: string): string => {
    if (!priceStr || priceStr.toLowerCase() === "free") return "Free";
    // Extract numeric value - assume input is in NGN
    const num = Number(priceStr.replace(/[^0-9.]/g, ""));
    if (isNaN(num) || num === 0) return "Free";
    const converted = convertAmount(num);
    return `${currency.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: currency.code === "NGN" ? 0 : 2, maximumFractionDigits: currency.code === "NGN" ? 0 : 2 })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, convertAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used within CurrencyProvider");
  return context;
};
