import { Home, Compass, Plus, Ticket, User, LogIn } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface Tab {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  match: (p: string) => boolean;
}

const MobileTabBar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const isHost = user?.user_metadata?.account_type === "host";

  const tabs: Tab[] = user
    ? [
        { key: "home", label: "Home", icon: Home, path: "/", match: (p) => p === "/" },
        { key: "discover", label: "Discover", icon: Compass, path: "/events", match: (p) => p.startsWith("/events") },
        {
          key: "create",
          label: "Create",
          icon: Plus,
          path: isHost ? "/create-event" : "/bloov-create",
          match: (p) => p === "/create-event" || p.startsWith("/bloov-create"),
        },
        { key: "tickets", label: "Tickets", icon: Ticket, path: "/my-tickets", match: (p) => p.startsWith("/my-tickets") },
        { key: "profile", label: "Profile", icon: User, path: "/profile", match: (p) => p.startsWith("/profile") || p === "/dashboard" },
      ]
    : [
        { key: "home", label: "Home", icon: Home, path: "/", match: (p) => p === "/" },
        { key: "discover", label: "Discover", icon: Compass, path: "/events", match: (p) => p.startsWith("/events") },
        { key: "create", label: "Create", icon: Plus, path: "/signin", match: () => false },
        { key: "signin", label: "Sign in", icon: LogIn, path: "/signin", match: (p) => p.startsWith("/signin") || p.startsWith("/signup") },
      ];

  // Hide on auth pages
  if (pathname.startsWith("/signin") || pathname.startsWith("/signup") || pathname.startsWith("/forgot-password") || pathname.startsWith("/reset-password")) {
    return null;
  }

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 glass-panel border-t border-border/60 pb-safe"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
      aria-label="Primary mobile navigation"
    >
      <div className="grid grid-cols-5 px-1 pt-1.5 pb-1.5" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.match(pathname);
          const isCreate = tab.key === "create";
          return (
            <button
              key={tab.key}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center justify-center gap-0.5 py-1.5 min-h-[52px] active:scale-95 transition-transform"
              aria-label={tab.label}
              aria-current={active ? "page" : undefined}
            >
              <span
                className={`flex items-center justify-center h-9 w-9 rounded-full transition-colors ${
                  isCreate
                    ? "btn-gradient-brand shadow-lg"
                    : active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <Icon className={isCreate ? "h-5 w-5 text-primary-foreground" : "h-5 w-5"} />
              </span>
              <span
                className={`text-[10px] font-semibold leading-none truncate max-w-full ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileTabBar;
