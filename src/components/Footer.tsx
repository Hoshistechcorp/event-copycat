import mainLogo from "@/assets/mainlogo.png";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-14">
      <div className="container px-4 md:px-8">
        <div className="grid sm:grid-cols-3 gap-10 mb-10">
          <div>
            <img src={mainLogo} alt="iBLOOV logo" className="h-10 w-auto mb-3 brightness-0 invert" />
            <p className="text-sm opacity-60 leading-relaxed">
              Delightful events start here. The #1 event platform in Africa.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Platform</h4>
            <ul className="space-y-2 text-sm opacity-60">
              <li><a href="#events" className="hover:opacity-100 transition-opacity">Explore Events</a></li>
              <li><a href="#nightlife" className="hover:opacity-100 transition-opacity">Nightlife</a></li>
              <li><a href="#creators" className="hover:opacity-100 transition-opacity">For Creators</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm opacity-60">
              <li><a href="#features" className="hover:opacity-100 transition-opacity">Features</a></li>
              <li><a href="#testimonials" className="hover:opacity-100 transition-opacity">Testimonials</a></li>
              <li><a href="#hero" className="hover:opacity-100 transition-opacity">Back to Top</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-background/10 pt-6 text-center text-sm opacity-40">
          © 2026 iBLOOV. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
