import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, Settings, MessageSquare, Loader2 } from "lucide-react";
import logoForLight from "@assets/logo-horizontal.png";
import logoForDark from "@assets/logo-white.png";
import { Link, useLocation } from "wouter";
import { EnrollmentWizard } from "@/components/enrollment-wizard";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface WaitingAssignmentProps {
  teamNotFound?: boolean;
}

export default function WaitingAssignment({ teamNotFound = false }: WaitingAssignmentProps) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [autoJoining, setAutoJoining] = useState(false);
  
  // Redirect super admins to their dashboard
  useEffect(() => {
    const adminValue = user?.isAdmin as unknown;
    const isAdmin = adminValue === true || adminValue === 'true' || adminValue === 'super_admin';
    if (isAdmin) {
      setLocation('/super-admin');
    }
  }, [user, setLocation]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get("joinCode");
    if (!joinCode || autoJoining) return;

    setAutoJoining(true);
    (async () => {
      try {
        const res = await apiRequest("POST", "/api/join/complete", {});
        const data = await res.json();
        if (data.success) {
          toast({ title: data.alreadyMember ? "Already a member" : "Joined successfully", description: `Organization: ${data.organizationName}` });
          queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
          queryClient.invalidateQueries({ queryKey: ["/api/team"] });
          window.history.replaceState({}, "", "/");
          setLocation("/");
        }
      } catch (error: any) {
        toast({ title: "Could not auto-join", description: error.message || "Please enter your team code manually.", variant: "destructive" });
        window.history.replaceState({}, "", "/");
      } finally {
        setAutoJoining(false);
      }
    })();
  }, []);

  const handleEnrollmentComplete = () => {
    setLocation('/');
  };

  if (autoJoining) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Joining your class...</p>
        </div>
      </div>
    );
  }

  // If team was not found (error state), show simplified message
  if (teamNotFound) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
            <img 
              src={logoForLight} 
              alt="Future Work Academy" 
              className="h-16 w-auto block dark:hidden"
              data-testid="img-header-logo-light"
            />
            <img 
              src={logoForDark} 
              alt="Future Work Academy" 
              className="h-16 w-auto hidden dark:block"
              data-testid="img-header-logo-dark"
            />
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="outline" onClick={() => logout()} data-testid="button-logout">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 max-w-lg text-center">
          <div className="space-y-6">
            <div className="mx-auto h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
              <MessageSquare className="h-10 w-10 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold">Team Data Not Found</h1>
            <p className="text-muted-foreground">
              Your team data was not found. This may happen after a server restart. 
              Please contact your instructor to reassign you to a team.
            </p>
            <Link href="/feedback">
              <Button data-testid="link-contact-support">
                Contact Support
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <img 
            src={logoForLight} 
            alt="Future Work Academy" 
            className="h-16 w-auto block dark:hidden"
            data-testid="img-header-logo-light"
          />
          <img 
            src={logoForDark} 
            alt="Future Work Academy" 
            className="h-16 w-auto hidden dark:block"
            data-testid="img-header-logo-dark"
          />
          <div className="flex items-center gap-3">
            {user?.isAdmin === "true" && (
              <Link href="/admin">
                <Button variant="outline" data-testid="link-admin">
                  <Settings className="mr-2 h-4 w-4" />
                  Admin
                </Button>
              </Link>
            )}
            <ThemeToggle />
            <Button variant="outline" onClick={() => logout()} data-testid="button-logout">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome message */}
        <div className="text-center mb-8 max-w-xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">
            Welcome{user?.firstName ? `, ${user.firstName}` : ''}!
          </h1>
          <p className="text-muted-foreground">
            Complete the steps below to join your class simulation.
          </p>
        </div>
        
        {/* Enrollment Wizard */}
        <EnrollmentWizard 
          user={user} 
          onComplete={handleEnrollmentComplete} 
        />
        
        {/* Help link */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>
            Need help?{" "}
            <Link href="/feedback">
              <Button variant="ghost" className="p-0 h-auto text-primary" data-testid="link-feedback">
                Contact support
              </Button>
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
