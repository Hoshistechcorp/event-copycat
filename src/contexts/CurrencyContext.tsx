import { createContext, useContext, useState, ReactNode } from "react";

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number; // rate relative to NGN (base)
}

// Rates are relative to NGN (the database storage base). Display currency is user-selectable.
export const currencies: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar", rate: 0.00062 },
  { code: "EUR", symbol: "€", name: "Euro", rate: 0.00057 },
  { code: "GBP", symbol: "£", name: "British Pound", rate: 0.00049 },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", rate: 0.00086 },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", rate: 0.00094 },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", rate: 0.094 },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", rate: 0.0023 },
  { code: "INR", symbol: "₹", name: "Indian Rupee", rate: 0.052 },
  { code: "ZAR", symbol: "R", name: "South African Rand", rate: 0.011 },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", rate: 0.0034 },
  { code: "GHS", symbol: "GH₵", name: "Ghanaian Cedi", rate: 0.0093 },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling", rate: 0.08 },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira", rate: 1 },
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
