import { UserCircle, Sparkles, Users, Briefcase, Wallet, Trophy, Camera, Award, Plane, type LucideIcon } from "lucide-react";

export interface AuraProduct {
  id: string;
  name: string;
  tagline: string;
  description: string;
  /** Tailwind text color token (works for icon + glow) */
  color: string;
  /** Tailwind bg fragment for glow ring */
  glow: string;
  icon: LucideIcon;
  route: string;
  /** Always-on (cannot be unlinked) */
  alwaysLinked?: boolean;
  /** Internal product (vs stub) */
  internal?: boolean;
}

export const AURA_PRODUCTS: AuraProduct[] = [
  { id: "auralink", name: "AuraLink", tagline: "Digital Identity", description: "Your unified iBloov identity & dashboard.", color: "text-teal-400", glow: "shadow-[0_0_30px_-5px_rgba(45,212,191,0.5)]", icon: UserCircle, route: "/profile", alwaysLinked: true, internal: true },
  { id: "bloov", name: "Bloov", tagline: "Venues & Discovery", description: "Discover and book unforgettable events worldwide.", color: "text-purple-400", glow: "shadow-[0_0_30px_-5px_rgba(192,132,252,0.5)]", icon: Sparkles, route: "/events", internal: true },
  { id: "tribemint", name: "TribeMint", tagline: "Affiliate & Creator Hub", description: "Mint your tribe — earn from referrals and creator drops.", color: "text-pink-400", glow: "shadow-[0_0_30px_-5px_rgba(244,114,182,0.5)]", icon: Users, route: "/tribemint" },
  { id: "vibesgigs", name: "VibesGigs", tagline: "Hospitality Staffing", description: "Hire vetted hospitality talent on-demand.", color: "text-green-400", glow: "shadow-[0_0_30px_-5px_rgba(74,222,128,0.5)]", icon: Briefcase, route: "/vibesgigs" },
  { id: "flexit", name: "Flex-it", tagline: "Tipping & Payments", description: "Send tips, receive payments, anywhere.", color: "text-emerald-400", glow: "shadow-[0_0_30px_-5px_rgba(52,211,153,0.5)]", icon: Wallet, route: "/flexit" },
  { id: "sportmate", name: "Sportmate", tagline: "Sports & Games", description: "Find pickup games, leagues, and teammates.", color: "text-orange-400", glow: "shadow-[0_0_30px_-5px_rgba(251,146,60,0.5)]", icon: Trophy, route: "/sportmate" },
  { id: "pov", name: "iBloov POV", tagline: "Picture Share & Live Walls", description: "Live photo walls and POV moments from every event.", color: "text-yellow-400", glow: "shadow-[0_0_30px_-5px_rgba(250,204,21,0.5)]", icon: Camera, route: "/pov" },
  { id: "spark", name: "Spark", tagline: "Certifications & Badges", description: "Earn verifiable badges and creator credentials.", color: "text-blue-400", glow: "shadow-[0_0_30px_-5px_rgba(96,165,250,0.5)]", icon: Award, route: "/spark" },
  { id: "kiatravel", name: "Kia Travel", tagline: "AI Trip Planning", description: "AI-built itineraries for events you love.", color: "text-cyan-400", glow: "shadow-[0_0_30px_-5px_rgba(34,211,238,0.5)]", icon: Plane, route: "/kia-travel" },
];

export const getProduct = (id: string) => AURA_PRODUCTS.find((p) => p.id === id);
