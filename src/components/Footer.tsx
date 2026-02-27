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
              <li><a href="/" className="hover:opacity-100 transition-opacity">Explore Events</a></li>
              <li><a href="/dashboard" className="hover:opacity-100 transition-opacity">Organize</a></li>
              <li><a href="/create" className="hover:opacity-100 transition-opacity">Create Event</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm opacity-60">
              <li><a href="#" className="hover:opacity-100 transition-opacity">About</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Privacy Policy</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Terms of Service</a></li>
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
