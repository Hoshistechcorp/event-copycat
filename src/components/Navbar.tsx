import { Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import mainLogo from "@/assets/mainlogo.png";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16 px-4 md:px-8">
        <div className="flex items-center gap-8">
          <a href="/" className="flex items-center gap-2">
            <img src={mainLogo} alt="iBLOOV logo" className="h-9 w-auto" />
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
          <Button size="sm" className="hidden sm:inline-flex rounded-full px-5 font-semibold">
            Create Event
          </Button>

          {/* Mobile hamburger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] pt-10">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex flex-col gap-6">
                <a href="/" className="flex items-center gap-2 mb-4">
                  <img src={mainLogo} alt="iBLOOV logo" className="h-8 w-auto" />
                </a>

                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search experiences..."
                    className="w-full h-10 pl-10 pr-4 rounded-full bg-secondary text-sm text-foreground placeholder:text-muted-foreground border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <nav className="flex flex-col gap-4">
                  <a href="/" className="text-base font-semibold text-foreground hover:text-primary transition-colors">
                    Explore
                  </a>
                  <a href="/dashboard" className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Organize
                  </a>
                  <a href="/signin" className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Sign In
                  </a>
                </nav>

                <Button className="rounded-full font-semibold mt-2 w-full">
                  Create Event
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
