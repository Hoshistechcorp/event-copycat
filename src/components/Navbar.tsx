import { useState, useRef, useEffect } from "react";
import { Search, Menu, LogOut, User, LayoutDashboard, Plus, Megaphone, Wallet, Ticket, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import mainLogo from "@/assets/mainlogo.png";
import NebulaMenu from "@/components/aura/NebulaMenu";
import { useAuraLinks } from "@/hooks/useAuraLinks";
import { getProduct } from "@/lib/auraProducts";

const navLinkClass = (isActive: boolean) =>
  `text-sm font-medium transition-colors whitespace-nowrap ${isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"}`;

const mobileNavLinkClass = (isActive: boolean) =>
  `flex items-center gap-3 min-h-[44px] px-3 rounded-lg text-[15px] font-medium transition-colors min-w-0 w-full ${
    isActive ? "bg-primary/10 text-primary font-semibold" : "text-foreground hover:bg-secondary"
  }`;

const Navbar = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { pinnedIds } = useAuraLinks();
  const pinnedProducts = pinnedIds.map((id) => getProduct(id)).filter(Boolean);
  const [sheetOpen, setSheetOpen] = useState(false);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  const isHost = user?.user_metadata?.account_type === "host";

  useEffect(() => {
    if (sheetOpen) {
      // Slight delay so the sheet animation doesn't steal focus
      const t = setTimeout(() => mobileSearchRef.current?.focus(), 250);
      return () => clearTimeout(t);
    }
  }, [sheetOpen]);

  const closeSheet = () => setSheetOpen(false);

  const handleNavigate = (path: string) => {
    navigate(path);
    closeSheet();
  };

  const handleCreateEvents = (e: React.MouseEvent) => {
    e.preventDefault();
    closeSheet();
    if (user) {
      navigate("/create-event");
    } else {
      navigate("/signin");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    closeSheet();
    navigate("/");
  };

  const initials = user?.user_metadata?.display_name
    ? user.user_metadata.display_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16 gap-2 px-3 md:px-8 max-w-full overflow-hidden">
        <div className="flex items-center gap-8 min-w-0 flex-shrink">
          <a href="/" className="flex items-center gap-2 flex-shrink-0">
            <img src={mainLogo} alt="iBLOOV logo" className="h-4 sm:h-5 w-auto max-w-[90px] sm:max-w-[120px] object-contain" />
          </a>
          <div className="hidden lg:flex items-center gap-5 xl:gap-6">
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

        <div className="hidden lg:flex items-center flex-1 max-w-md mx-6 xl:mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search experiences..."
              className="w-full h-10 pl-10 pr-4 rounded-full bg-secondary text-sm text-foreground placeholder:text-muted-foreground border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-3 flex-shrink-0">
          {/* Pinned AURA products - desktop only to keep mobile clean */}
          {user && pinnedProducts.length > 0 && (
            <div className="hidden lg:flex items-center gap-1 pr-1 border-r border-border mr-1">
              {pinnedProducts.map((p) => {
                const Icon = p!.icon;
                return (
                  <button
                    key={p!.id}
                    onClick={() => navigate(p!.route)}
                    title={p!.name}
                    className={`h-8 w-8 rounded-lg bg-secondary/50 hover:bg-secondary flex items-center justify-center transition-colors ${p!.color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Nebula 9-dot menu */}
          {user && <NebulaMenu />}

          {!isHost && (
            <a href="/my-tickets" className={`hidden lg:inline-flex ${navLinkClass(location.pathname === "/my-tickets")}`}>
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
                      className="hidden lg:inline-flex rounded-full px-4 font-semibold text-xs gap-1.5"
                      onClick={() => navigate("/create-event")}
                    >
                      <Plus className="h-3.5 w-3.5" /> New Event
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="hidden lg:flex items-center gap-2 rounded-full px-2 h-9">
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
                      <DropdownMenuItem onClick={() => navigate("/dashboard")} className="text-xs cursor-pointer">
                        <LayoutDashboard className="w-3.5 h-3.5 mr-2" /> Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/profile")} className="text-xs cursor-pointer">
                        <User className="w-3.5 h-3.5 mr-2" /> Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/profile?tab=settings")} className="text-xs cursor-pointer">
                        <Settings className="w-3.5 h-3.5 mr-2" /> Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/my-tickets")} className="text-xs cursor-pointer">
                        <Ticket className="w-3.5 h-3.5 mr-2" /> My Tickets
                      </DropdownMenuItem>
                      {isHost && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate("/dashboard?tab=wallet")} className="text-xs cursor-pointer">
                            <Wallet className="w-3.5 h-3.5 mr-2" /> Wallet
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate("/dashboard?tab=promotions")} className="text-xs cursor-pointer">
                            <Megaphone className="w-3.5 h-3.5 mr-2" /> Promotions
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="text-xs text-destructive cursor-pointer">
                        <LogOut className="w-3.5 h-3.5 mr-2" /> Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button size="sm" className="hidden lg:inline-flex rounded-full px-5 font-semibold" asChild>
                  <a href="/signin">Sign in</a>
                </Button>
              )}
            </>
          )}

          {/* Mobile hamburger */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden h-10 w-10 flex-shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[340px] p-0 flex flex-col">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

              {/* Header: user identity / sign-in CTA */}
              <div className="px-4 pt-6 pb-4 border-b border-border">
                {user ? (
                  <button
                    onClick={() => handleNavigate("/profile")}
                    className="flex items-center gap-3 w-full text-left"
                  >
                    <Avatar className="h-11 w-11">
                      <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {user.user_metadata?.display_name || user.email}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                    </div>
                    {isHost && (
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-bold flex-shrink-0">HOST</Badge>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <img src={mainLogo} alt="iBLOOV logo" className="h-5 w-auto" />
                  </div>
                )}
              </div>

              {/* Search */}
              <div className="px-4 py-3 border-b border-border">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    ref={mobileSearchRef}
                    type="search"
                    inputMode="search"
                    autoComplete="off"
                    placeholder="Search experiences..."
                    className="w-full h-11 pl-10 pr-4 rounded-full bg-secondary text-sm text-foreground placeholder:text-muted-foreground border-none outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                </div>
              </div>

              {/* Quick actions for signed-in users */}
              {user && (
                <div className="px-3 py-2 border-b border-border">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleNavigate("/dashboard")}
                      className="flex flex-col items-center gap-1 py-2.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors min-h-[60px]"
                    >
                      <LayoutDashboard className="h-4 w-4 text-primary" />
                      <span className="text-[10px] font-medium">Dashboard</span>
                    </button>
                    <button
                      onClick={() => handleNavigate("/profile")}
                      className="flex flex-col items-center gap-1 py-2.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors min-h-[60px]"
                    >
                      <User className="h-4 w-4 text-primary" />
                      <span className="text-[10px] font-medium">Profile</span>
                    </button>
                    <button
                      onClick={() => handleNavigate("/profile?tab=settings")}
                      className="flex flex-col items-center gap-1 py-2.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors min-h-[60px]"
                    >
                      <Settings className="h-4 w-4 text-primary" />
                      <span className="text-[10px] font-medium">Settings</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Main nav */}
              <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
                <button onClick={() => handleNavigate("/events")} className={`w-full text-left ${mobileNavLinkClass(location.pathname === "/events")}`}>
                  <Search className="h-4 w-4" /> Find Events
                </button>
                <button onClick={() => handleNavigate("/bloov-create")} className={`w-full text-left ${mobileNavLinkClass(location.pathname.startsWith("/bloov-create"))}`}>
                  <Plus className="h-4 w-4" /> Bloov Create
                </button>
                <button onClick={() => handleNavigate("/bloov-service")} className={`w-full text-left ${mobileNavLinkClass(location.pathname.startsWith("/bloov-service"))}`}>
                  <Megaphone className="h-4 w-4" /> Bloov Service
                </button>
                <button onClick={() => handleNavigate("/event-planner")} className={`w-full text-left ${mobileNavLinkClass(location.pathname.startsWith("/event-planner"))}`}>
                  <LayoutDashboard className="h-4 w-4" /> Event Planner
                </button>
                <button onClick={() => handleNavigate("/sponsorships")} className={`w-full text-left ${mobileNavLinkClass(location.pathname.startsWith("/sponsorships"))}`}>
                  <Megaphone className="h-4 w-4" /> Sponsorships
                </button>
                <button onClick={handleCreateEvents} className={`w-full text-left ${mobileNavLinkClass(location.pathname === "/create-event")}`}>
                  <Plus className="h-4 w-4" /> Create Events
                </button>
                <button onClick={() => handleNavigate("/my-tickets")} className={`w-full text-left ${mobileNavLinkClass(location.pathname === "/my-tickets")}`}>
                  <Ticket className="h-4 w-4" /> My Tickets
                </button>

                {isHost && (
                  <>
                    <div className="pt-3 pb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Host</div>
                    <button onClick={() => handleNavigate("/dashboard?tab=wallet")} className={`w-full text-left ${mobileNavLinkClass(false)}`}>
                      <Wallet className="h-4 w-4" /> Wallet
                    </button>
                    <button onClick={() => handleNavigate("/dashboard?tab=promotions")} className={`w-full text-left ${mobileNavLinkClass(false)}`}>
                      <Megaphone className="h-4 w-4" /> Promotions
                    </button>
                  </>
                )}
              </nav>

              {/* Footer auth action */}
              <div className="border-t border-border p-3">
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full min-h-[44px] px-3 rounded-lg text-[15px] font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                ) : (
                  <Button className="w-full rounded-full font-semibold h-11" onClick={() => handleNavigate("/signin")}>
                    Sign in
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
