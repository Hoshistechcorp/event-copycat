import { Instagram, Linkedin } from "lucide-react";
import mainLogo from "@/assets/mainlogo.png";

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.87a8.16 8.16 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.3z" />
  </svg>
);

const linkGroups: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Discover events", href: "/events" },
      { label: "Bloov Service", href: "/bloov-service" },
      { label: "Sponsorships", href: "/sponsorships" },
      { label: "Orbit", href: "https://orbit-connect-joy.lovable.app/aura" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "FAQs", href: "/faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="container max-w-6xl px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-3">
              <img src={mainLogo} alt="iBloov logo" className="h-9 w-auto" />
              <span className="bg-accent text-accent-foreground text-[9px] font-bold px-1.5 py-0.5 rounded">
                BETA
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Technology that makes you smile.
            </p>
            <div className="flex items-center gap-2">
              {[
                { Icon: XIcon, href: "#" },
                { Icon: Instagram, href: "#" },
                { Icon: Linkedin, href: "#" },
                { Icon: TikTokIcon, href: "#" },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link groups */}
          <div className="grid grid-cols-3 gap-8 md:gap-12">
            {linkGroups.map((g) => (
              <div key={g.title}>
                <h4 className="font-bold text-[11px] text-foreground uppercase tracking-wider mb-3">
                  {g.title}
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {g.links.map((l) => (
                    <li key={l.label}>
                      <a href={l.href} className="hover:text-foreground transition-colors">
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted-foreground">
          <p>© 2026 iBloov. All rights reserved.</p>
          <div className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Platform is live
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
