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

const Footer = () => {
  return (
    <footer className="bg-secondary/50 pt-16 pb-6">
      <div className="container px-4 md:px-8">
        <div className="bg-background rounded-2xl border border-border p-8 md:p-12 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Brand column */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src={mainLogo} alt="iBLOOV logo" className="h-14 w-auto" />
                <span className="bg-accent text-accent-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">BETA</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                Technology that makes Africa smile.
              </p>
              <div className="flex items-center gap-2 mb-5">
                <a href="#" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:scale-110">
                  <XIcon className="w-3.5 h-3.5" />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-md">
                  <Instagram className="w-3.5 h-3.5" />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:scale-110">
                  <Linkedin className="w-3.5 h-3.5" />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:scale-110">
                  <TikTokIcon className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="inline-flex items-center gap-2 bg-secondary rounded-full px-3 py-1.5 text-xs font-medium text-foreground">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Platform Is Live
              </div>
            </div>

            {/* Products */}
            <div>
              <h4 className="font-bold text-sm text-foreground uppercase tracking-wide mb-4">Products</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><a href="#events" className="hover:text-foreground transition-colors">Ibloov Events</a></li>
                <li><a href="#nightlife" className="hover:text-foreground transition-colors">Ibloov Learning</a></li>
                <li><a href="#features" className="hover:text-foreground transition-colors">Ibloov Flex-it</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold text-sm text-foreground uppercase tracking-wide mb-4">Company</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><a href="#hero" className="hover:text-foreground transition-colors">About Ibloov</a></li>
                <li><a href="#creators" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#testimonials" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#creators" className="hover:text-foreground transition-colors">Campus Ambassadors</a></li>
              </ul>
            </div>

            {/* Community */}
            <div>
              <h4 className="font-bold text-sm text-foreground uppercase tracking-wide mb-4">Community</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Join Community</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Twitter / X</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Instagram</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold text-sm text-foreground uppercase tracking-wide mb-4">Support</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 Ibloov Africa — Technology that makes you smile.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Code of Conduct</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
