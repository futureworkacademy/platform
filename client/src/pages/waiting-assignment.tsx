import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { Factory, Clock, Mail, LogOut } from "lucide-react";

export default function WaitingAssignment() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <Factory className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">Future of Work</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="outline" onClick={() => logout()} data-testid="button-logout">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-2xl">
        <Card className="bg-card">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Waiting for Team Assignment</CardTitle>
            <CardDescription className="text-base mt-2">
              Welcome, {user?.firstName || user?.email}! Your account has been created successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-md p-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                Your instructor will assign you to a team before the simulation begins. 
                Once assigned, you'll be able to access the game dashboard and start 
                making strategic decisions with your team.
              </p>
            </div>

            <div className="border rounded-md p-4 space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Your Account Details
              </h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-mono" data-testid="text-user-email">{user?.email || "Not available"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span data-testid="text-user-name">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user?.firstName || "Not set"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Team:</span>
                  <span className="text-muted-foreground italic" data-testid="text-team-status">Not assigned</span>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>Please check back later or contact your instructor if you believe you should already be assigned to a team.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
