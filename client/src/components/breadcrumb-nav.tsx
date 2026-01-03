import { Link, useLocation } from "wouter";
import { ChevronRight, Home } from "lucide-react";

const routeLabels: Record<string, string> = {
  "/": "Dashboard",
  "/briefing": "Intelligence Briefing",
  "/decisions": "Decisions",
  "/analytics": "People Analytics",
  "/leaderboard": "Leaderboard",
  "/about": "About",
};

export function BreadcrumbNav() {
  const [location] = useLocation();
  
  const currentLabel = routeLabels[location] || "Page";
  const isHome = location === "/";

  return (
    <nav className="flex items-center gap-1 text-sm" aria-label="Breadcrumb" data-testid="nav-breadcrumb">
      <Link 
        href="/" 
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        data-testid="link-breadcrumb-home"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Home</span>
      </Link>
      {!isHome && (
        <>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium text-foreground" data-testid="text-breadcrumb-current">
            {currentLabel}
          </span>
        </>
      )}
    </nav>
  );
}
