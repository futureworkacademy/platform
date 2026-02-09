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
import ForStudents from "@/pages/for-students";
import Brochure from "@/pages/brochure";
import EducatorInquiries from "@/pages/educator-inquiries";
import Privacy from "@/pages/privacy";
import SimulationContentEditor from "@/pages/simulation-content-editor";
import CharacterProfilesEditor from "@/pages/character-profiles-editor";
import ContentValidation from "@/pages/content-validation";
import StudentGuidePage from "@/pages/guides/student-guide";
import InstructorGuidePage from "@/pages/guides/instructor-guide";
import NotFound from "@/pages/not-found";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { SandboxControls } from "@/components/sandbox-controls";
import { DemoPreviewControls } from "@/components/demo-preview-controls";
import { PreviewBanner } from "@/components/preview-banner";
import { Skeleton } from "@/components/ui/skeleton";
import { FlaskConical, Eye } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import type { Team } from "@shared/schema";
import { DemoTourProvider } from "@/components/demo-tour-provider";

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
  
  const previewRole = user?.previewRole as string | null;
  const previewOrgId = user?.previewOrgId as string | null;
  const inSandboxMode = previewRole === "student" || user?.inStudentPreview === true;
  const sandboxOrgId = previewOrgId || (user?.previewModeOrgId as string | null);
  const isUnifiedPreview = !!previewRole;

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
          {/* Legacy Sandbox Mode Banner - only shown for old sandbox flow, not unified preview */}
          {inSandboxMode && !isUnifiedPreview && (
            <div className="bg-amber-500 dark:bg-amber-600 text-white px-4 py-2 flex items-center justify-center gap-3 text-sm font-medium">
              <FlaskConical className="h-4 w-4" />
              <span>SANDBOX MODE - You are previewing the student experience</span>
              <span className="text-amber-200">|</span>
              <span>Use controls at bottom to navigate weeks</span>
            </div>
          )}
          <header className={`flex items-center justify-between gap-4 p-3 border-b backdrop-blur-sm sticky top-0 z-50 ${inSandboxMode && !isUnifiedPreview ? 'bg-amber-100/50 dark:bg-amber-900/20' : 'bg-card/50'}`}>
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
              <Route path="/student-guide">{() => <Redirect to="/guides/student" />}</Route>
              <Route component={NotFound} />
            </Switch>
          </main>
          
          {/* Legacy Sandbox Controls - only shown for old sandbox flow, not unified preview */}
          {inSandboxMode && !isUnifiedPreview && sandboxOrgId && team && (
            <SandboxControls 
              orgId={sandboxOrgId}
              currentWeek={team.currentWeek}
            />
          )}
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
    if (location === "/for-educators") {
      return <ForEducators />;
    }
    if (location === "/for-students") {
      return <ForStudents />;
    }
    if (location === "/about") {
      return <About />;
    }
    if (location === "/privacy") {
      return <Privacy />;
    }
    if (location === "/brochure") {
      return <Brochure />;
    }
    if (location === "/student-guide") {
      return <Redirect to="/guides/student" />;
    }
    if (location === "/guides/student") {
      return <StudentGuidePage />;
    }
    if (location === "/guides/instructor") {
      return <InstructorGuidePage />;
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

  // Simulation Content Editor - role checked internally
  if (location === "/admin/simulation-content") {
    return <SimulationContentEditor />;
  }

  // Character Profiles Editor - role checked internally
  if (location === "/admin/character-profiles") {
    return <CharacterProfilesEditor />;
  }

  // Content Validation Dashboard - role checked internally
  if (location === "/admin/content-validation") {
    return <ContentValidation />;
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

  if (location === "/for-educators") {
    return <ForEducators />;
  }

  if (location === "/for-students") {
    return <ForStudents />;
  }

  if (location === "/brochure") {
    return <Brochure />;
  }

  if (location === "/student-guide") {
    return <Redirect to="/guides/student" />;
  }

  if (location === "/guides/student") {
    return <StudentGuidePage />;
  }

  if (location === "/guides/instructor") {
    return <InstructorGuidePage />;
  }

  // Super Admin - always redirect to admin dashboard if not already there
  // This check happens BEFORE the teamId check to ensure admins never see WaitingAssignment
  // Handle both boolean true AND string 'true'/'super_admin' for robustness (runtime type may differ)
  const adminValue = user.isAdmin as unknown;
  const isAdminUser = adminValue === true || adminValue === 'true' || adminValue === 'super_admin';
  
  // Unified preview mode check
  const previewRole = user.previewRole as string | null;
  const previewOrgId = user.previewOrgId as string | null;
  const isInPreviewMode = !!previewRole && !!previewOrgId;
  
  // Legacy preview checks (for backward compat during transition)
  const isInSandboxMode = user.inStudentPreview === true;
  const isInDemoPreview = user.inDemoPreview === true;
  const isInInstructorPreview = user.inInstructorPreview === true;
  const isInAnyPreview = isInPreviewMode || isInSandboxMode || isInDemoPreview || isInInstructorPreview;
  
  // If admin is NOT in any preview mode, constrain to admin pages
  if (isAdminUser && !isInAnyPreview) {
    if (location !== '/super-admin' && location !== '/admin' && location !== '/educator-inquiries' && location !== '/profile' && location !== '/about' && location !== '/for-educators' && location !== '/brochure' && !location.startsWith('/class-admin') && !location.startsWith('/admin/')) {
      return <Redirect to="/super-admin" />;
    }
  }
  
  // If in educator preview, redirect to class-admin for that org
  if (isAdminUser && isInPreviewMode && previewRole === "educator") {
    if (location !== '/profile' && location !== '/about' && !location.startsWith('/class-admin')) {
      return <Redirect to={`/class-admin?org=${previewOrgId}`} />;
    }
  }
  
  // If in student preview, allow access to student pages (dashboard, briefing, etc.)
  if (isAdminUser && isInPreviewMode && previewRole === "student") {
    // Student preview allows all non-admin pages
  }
  
  // Legacy instructor preview redirect (for users who entered before this update)
  if (isAdminUser && isInInstructorPreview && !isInPreviewMode) {
    const instructorPreviewOrgId = user.instructorPreviewOrgId as string | null;
    if (instructorPreviewOrgId && location !== '/profile' && location !== '/about' && !location.startsWith('/class-admin')) {
      return <Redirect to={`/class-admin?org=${instructorPreviewOrgId}`} />;
    }
  }

  // Non-admin without team goes to waiting assignment
  if (!user.teamId) {
    return <WaitingAssignment />;
  }

  return <AuthenticatedApp />;
}

function PreviewBannerWrapper() {
  const { user } = useAuth();
  const previewRole = user?.previewRole as string | null;
  const previewOrgId = user?.previewOrgId as string | null;
  const isInPreviewMode = !!previewRole && !!previewOrgId;
  
  const { data: roleData } = useQuery<{
    organizations?: Array<{ id: string; name: string }>;
  }>({
    queryKey: ["/api/my-role"],
    enabled: isInPreviewMode,
  });
  
  const orgName = roleData?.organizations?.find(o => o.id === previewOrgId)?.name;
  
  // Also handle legacy demo preview
  const inDemoPreview = user?.inDemoPreview === true;
  const demoOrgId = user?.demoPreviewOrgId;
  const isEvaluator = user?.demoAccess === "evaluator" || inDemoPreview;
  
  if (isInPreviewMode) {
    return <PreviewBanner previewRole={previewRole!} previewOrgId={previewOrgId!} orgName={orgName} />;
  }
  
  if (inDemoPreview) {
    return <DemoPreviewControls demoOrgId={demoOrgId} isEvaluator={isEvaluator} />;
  }
  
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="fow-theme">
        <TooltipProvider>
          <DemoTourProvider>
            <PreviewBannerWrapper />
            <AppRouter />
          </DemoTourProvider>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
