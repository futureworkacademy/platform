import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, Settings, MessageSquare } from "lucide-react";
import logoForLight from "@assets/logo-horizontal.png";
import logoForDark from "@assets/logo-white.png";
import { Link, useLocation } from "wouter";
import { EnrollmentWizard } from "@/components/enrollment-wizard";

interface WaitingAssignmentProps {
  teamNotFound?: boolean;
}

export default function WaitingAssignment({ teamNotFound = false }: WaitingAssignmentProps) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  
  // Redirect super admins to their dashboard
  useEffect(() => {
    const adminValue = user?.isAdmin as unknown;
    const isAdmin = adminValue === true || adminValue === 'true' || adminValue === 'super_admin';
    if (isAdmin) {
      setLocation('/super-admin');
    }
  }, [user, setLocation]);

  const handleEnrollmentComplete = () => {
    setLocation('/');
  };

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
