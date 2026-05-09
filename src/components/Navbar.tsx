import { Search, Menu, LogOut, User, LayoutDashboard, Plus, Megaphone, Wallet, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import mainLogo from "@/assets/mainlogo.png";

const navLinkClass = (isActive: boolean) =>
  `text-sm font-medium transition-colors ${isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"}`;

const mobileNavLinkClass = (isActive: boolean) =>
  `text-base font-medium transition-colors ${isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"}`;

const Navbar = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isHost = user?.user_metadata?.account_type === "host";

  const handleCreateEvents = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      navigate("/create-event");
    } else {
      navigate("/signin");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const initials = user?.user_metadata?.display_name
    ? user.user_metadata.display_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16 px-4 md:px-8">
        <div className="flex items-center gap-8">
          <a href="/" className="flex items-center gap-2">
            <img src={mainLogo} alt="iBLOOV logo" className="h-5 w-auto" />
          </a>
          <div className="hidden md:flex items-center gap-6">
            <a href="/events" className={navLinkClass(location.pathname === "/events")}>
              Find Events
            </a>
            <a href="/bloov-create" className={navLinkClass(location.pathname.startsWith("/bloov-create"))}>
              Bloov Create
            </a>
            <a href="/bloov-service" className={navLinkClass(location.pathname.startsWith("/bloov-service"))}>
              Bloov Service
            </a>
            <a href="/event-planner" className={navLinkClass(location.pathname.startsWith("/event-planner"))}>
              Event Planner
            </a>
            <a href="/sponsorships" className={navLinkClass(location.pathname.startsWith("/sponsorships"))}>
              Sponsorships
            </a>
            {isHost ? (
              <a href="/dashboard" className={navLinkClass(location.pathname === "/dashboard")}>
                Dashboard
              </a>
            ) : (
              <button onClick={handleCreateEvents} className={navLinkClass(location.pathname === "/create-event")}>
                Create Events
              </button>
            )}
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
          {!isHost && (
            <a href="/my-tickets" className={`hidden md:inline-flex ${navLinkClass(location.pathname === "/my-tickets")}`}>
              Find my tickets
            </a>
          )}

          {!loading && (
            <>
              {user ? (
                <>
                  {isHost && (
                    <Button
                      size="sm"
                      className="hidden md:inline-flex rounded-full px-4 font-semibold text-xs gap-1.5"
                      onClick={() => navigate("/create-event")}
                    >
                      <Plus className="h-3.5 w-3.5" /> New Event
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="hidden md:flex items-center gap-2 rounded-full px-2 h-9">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        {isHost && (
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-bold">HOST</Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl">
                      <div className="px-3 py-2">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {user.user_metadata?.display_name || user.email}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                        {isHost && (
                          <Badge variant="secondary" className="text-[9px] mt-1 px-1.5 py-0 h-4 font-bold">Event Host</Badge>
                        )}
                      </div>
                      <DropdownMenuSeparator />
                      {isHost && (
                        <>
                          <DropdownMenuItem onClick={() => navigate("/dashboard")} className="text-xs cursor-pointer">
                            <LayoutDashboard className="w-3.5 h-3.5 mr-2" /> Dashboard
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate("/dashboard?tab=wallet")} className="text-xs cursor-pointer">
                            <Wallet className="w-3.5 h-3.5 mr-2" /> Wallet
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate("/dashboard?tab=promotions")} className="text-xs cursor-pointer">
                            <Megaphone className="w-3.5 h-3.5 mr-2" /> Promotions
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      {!isHost && (
                        <DropdownMenuItem onClick={() => navigate("/dashboard")} className="text-xs cursor-pointer">
                          <LayoutDashboard className="w-3.5 h-3.5 mr-2" /> Dashboard
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => navigate("/profile")} className="text-xs cursor-pointer">
                        <User className="w-3.5 h-3.5 mr-2" /> Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/my-tickets")} className="text-xs cursor-pointer">
                        <Ticket className="w-3.5 h-3.5 mr-2" /> My Tickets
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="text-xs text-destructive cursor-pointer">
                        <LogOut className="w-3.5 h-3.5 mr-2" /> Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button size="sm" className="hidden md:inline-flex rounded-full px-5 font-semibold" asChild>
                  <a href="/signin">Sign in</a>
                </Button>
              )}
            </>
          )}

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
                  <img src={mainLogo} alt="iBLOOV logo" className="h-5 w-auto" />
                  {isHost && (
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-bold">HOST</Badge>
                  )}
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
                  <a href="/events" className={mobileNavLinkClass(location.pathname === "/events")}>
                    Find Events
                  </a>
                  <a href="/bloov-create" className={mobileNavLinkClass(location.pathname.startsWith("/bloov-create"))}>
                    Bloov Create
                  </a>
                  <a href="/bloov-service" className={mobileNavLinkClass(location.pathname.startsWith("/bloov-service"))}>
                    Bloov Service
                  </a>
                  <a href="/event-planner" className={mobileNavLinkClass(location.pathname.startsWith("/event-planner"))}>
                    Event Planner
                  </a>
                  <a href="/sponsorships" className={mobileNavLinkClass(location.pathname.startsWith("/sponsorships"))}>
                    Sponsorships
                  </a>
                  <button onClick={handleCreateEvents} className={`text-left ${mobileNavLinkClass(location.pathname === "/create-event")}`}>
                    Create Events
                  </button>
                  {isHost && (
                    <>
                      <a href="/dashboard" className={mobileNavLinkClass(location.pathname === "/dashboard")}>
                        Dashboard
                      </a>
                      <a href="/dashboard?tab=wallet" className={mobileNavLinkClass(false)}>
                        Wallet
                      </a>
                      <a href="/dashboard?tab=promotions" className={mobileNavLinkClass(false)}>
                        Promotions
                      </a>
                    </>
                  )}
                  <a href="/my-tickets" className={mobileNavLinkClass(location.pathname === "/my-tickets")}>
                    Find my tickets
                  </a>
                  {user ? (
                    <button onClick={handleSignOut} className="text-left text-base font-medium text-destructive hover:text-destructive/80 transition-colors">
                      Sign out
                    </button>
                  ) : (
                    <a href="/signin" className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors">
                      Sign in
                    </a>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
