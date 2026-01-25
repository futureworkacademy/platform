import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Landing from "@/pages/landing";
import WaitingAssignment from "@/pages/waiting-assignment";
import AdminPage from "@/pages/admin";
import SuperAdminPage from "@/pages/super-admin";
import SetupPage from "@/pages/setup";
import ClassAdminPage from "@/pages/class-admin";
import Research from "@/pages/research";
import Dashboard from "@/pages/dashboard";
import Briefing from "@/pages/briefing";
import Decisions from "@/pages/decisions";
import Analytics from "@/pages/analytics";
import Leaderboard from "@/pages/leaderboard";
import WeekResults from "@/pages/week-results";
import About from "@/pages/about";
import Profile from "@/pages/profile";
import Feedback from "@/pages/feedback";
import ForEducators from "@/pages/for-educators";
import EducatorInquiries from "@/pages/educator-inquiries";
import NotFound from "@/pages/not-found";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import type { Team } from "@shared/schema";

function Redirect({ to }: { to: string }) {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation(to);
  }, [to, setLocation]);
  return null;
}

function GameLayout() {
  const { user } = useAuth();
  const { data: team, isLoading } = useQuery<Team | null>({
    queryKey: ["/api/team"],
  });
  
  const isAdmin = user?.isAdmin === "true";

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className="h-12 w-12 rounded-md bg-primary animate-pulse" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-48 mx-auto" />
            <Skeleton className="h-3 w-32 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!team) {
    return <WaitingAssignment teamNotFound />;
  }

  if (!team.researchComplete) {
    return <Redirect to="/research" />;
  }

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar
          currentWeek={team.currentWeek}
          totalWeeks={team.totalWeeks}
          teamName={team.name}
          isAdmin={isAdmin}
        />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-4 p-3 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="flex items-center gap-3">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div className="h-4 w-px bg-border" />
              <BreadcrumbNav />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden md:inline font-mono">
                Week {team.currentWeek} / {team.totalWeeks}
              </span>
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/briefing" component={Briefing} />
              <Route path="/decisions" component={Decisions} />
              <Route path="/analytics" component={Analytics} />
              <Route path="/leaderboard" component={Leaderboard} />
              <Route path="/week-results" component={WeekResults} />
              <Route path="/about" component={About} />
              <Route path="/profile" component={Profile} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AuthenticatedApp() {
  const [location] = useLocation();
  const { data: team, isLoading } = useQuery<Team | null>({
    queryKey: ["/api/team"],
  });

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className="h-12 w-12 rounded-md bg-primary animate-pulse" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-48 mx-auto" />
            <Skeleton className="h-3 w-32 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (location === "/research") {
    if (!team) {
      return <Redirect to="/" />;
    }
    if (team.researchComplete) {
      return <Redirect to="/" />;
    }
    return <Research />;
  }

  return <GameLayout />;
}

function AppRouter() {
  const [location] = useLocation();
  const { user, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className="h-12 w-12 rounded-md bg-primary animate-pulse" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-48 mx-auto" />
            <Skeleton className="h-3 w-32 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    // Allow For Educators page without authentication
    if (location === "/for-educators") {
      return <ForEducators />;
    }
    return <Landing />;
  }

  // Admin page accessible to any logged-in user (will check isAdmin internally)
  if (location === "/admin") {
    return <AdminPage />;
  }

  // Super Admin page - role checked internally
  if (location === "/super-admin") {
    return <SuperAdminPage />;
  }

  // Educator Inquiries page - role checked internally
  if (location === "/educator-inquiries") {
    return <EducatorInquiries />;
  }

  // Setup page - for initial platform configuration
  if (location === "/setup") {
    return <SetupPage />;
  }

  // Class Admin page - role checked internally
  if (location.startsWith("/class-admin")) {
    return <ClassAdminPage />;
  }

  // Profile page - accessible to all logged-in users including admins
  if (location === "/profile") {
    return <Profile />;
  }

  // About page - accessible to all logged-in users including admins
  if (location === "/about") {
    return <About />;
  }

  // Feedback page accessible to any logged-in user
  if (location === "/feedback") {
    return <Feedback />;
  }

  // For Educators page accessible to any logged-in user
  if (location === "/for-educators") {
    return <ForEducators />;
  }

  // Super Admin - always redirect to admin dashboard if not already there
  // This check happens BEFORE the teamId check to ensure admins never see WaitingAssignment
  // Handle both boolean true AND string 'true'/'super_admin' for robustness (runtime type may differ)
  const adminValue = user.isAdmin as unknown;
  const isAdmin = adminValue === true || adminValue === 'true' || adminValue === 'super_admin';
  if (isAdmin) {
    if (location !== '/super-admin' && location !== '/admin' && location !== '/educator-inquiries' && location !== '/profile' && location !== '/about' && !location.startsWith('/class-admin')) {
      return <Redirect to="/super-admin" />;
    }
  }

  // Non-admin without team goes to waiting assignment
  if (!user.teamId) {
    return <WaitingAssignment />;
  }

  return <AuthenticatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="fow-theme">
        <TooltipProvider>
          <AppRouter />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
