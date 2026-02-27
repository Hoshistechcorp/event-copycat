import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16 px-4 md:px-8">
        <div className="flex items-center gap-8">
          <a href="/" className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight text-foreground">
              i<span className="text-primary">BLOOV</span>
            </span>
            <span className="text-[10px] font-semibold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-sm">
              BETA
            </span>
          </a>
          <div className="hidden md:flex items-center gap-6">
            <a href="/" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
              Explore
            </a>
            <a href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Organize
            </a>
          </div>
        </div>

        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search experiences..."
              className="w-full h-10 pl-10 pr-4 rounded-full bg-secondary text-sm text-foreground placeholder:text-muted-foreground border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a href="/signin" className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Sign In
          </a>
          <Button size="sm" className="rounded-full px-5 font-semibold">
            Create Event
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
