import mainLogo from "@/assets/mainlogo.png";

const Footer = () => {
  return (
    <footer className="bg-secondary/50 pt-16 pb-6">
      <div className="container px-4 md:px-8">
        {/* Main footer card */}
        <div className="bg-background rounded-2xl border border-border p-8 md:p-12 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Brand column */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src={mainLogo} alt="iBLOOV logo" className="h-8 w-auto" />
                <span className="bg-accent text-accent-foreground text-xs font-bold px-2 py-0.5 rounded">BETA</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                Technology that makes Africa smile.
              </p>
              {/* Social icons */}
              <div className="flex items-center gap-2 mb-5">
                {[
                  { label: "X", href: "#" },
                  { label: "IG", href: "#", highlight: true },
                  { label: "LI", href: "#" },
                  { label: "TK", href: "#" },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      s.highlight
                        ? "bg-accent text-accent-foreground"
                        : "bg-secondary text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {s.label}
                  </a>
                ))}
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
                <li><a href="#nightlife" className="hover:text-foreground transition-colors">Ibloov Nightlife</a></li>
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

        {/* Bottom bar */}
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
