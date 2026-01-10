import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Shield, CheckCircle, Loader2, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";

interface SetupStatus {
  hasSuperAdmin: boolean;
  superAdminCount: number;
}

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export default function SetupPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isInitializing, setIsInitializing] = useState(false);

  const { data: user, isLoading: userLoading } = useQuery<UserData>({
    queryKey: ["/api/auth/user"],
  });

  const { data: setupStatus, isLoading: statusLoading, refetch: refetchStatus } = useQuery<SetupStatus>({
    queryKey: ["/api/setup/status"],
  });

  const initializeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/setup/initialize-super-admin", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/setup/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-role"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ 
        title: "Success!", 
        description: "You are now the Super Admin. Redirecting to admin console..." 
      });
      setTimeout(() => {
        setLocation("/super-admin");
      }, 2000);
    },
    onError: (error: any) => {
      toast({ 
        title: "Initialization Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const handleInitialize = async () => {
    setIsInitializing(true);
    try {
      await initializeMutation.mutateAsync();
    } finally {
      setIsInitializing(false);
    }
  };

  if (userLoading || statusLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="loading-state">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4" data-testid="login-required">
        <AlertTriangle className="h-16 w-16 text-yellow-500" />
        <h1 className="text-2xl font-bold">Login Required</h1>
        <p className="text-muted-foreground text-center">
          Please sign in to set up the platform.
        </p>
        <Button onClick={() => setLocation("/")} data-testid="button-go-login">
          Go to Login
        </Button>
      </div>
    );
  }

  if (setupStatus?.hasSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4" data-testid="already-setup">
        <CheckCircle className="h-16 w-16 text-green-500" />
        <h1 className="text-2xl font-bold">Platform Already Configured</h1>
        <p className="text-muted-foreground text-center max-w-md">
          A Super Admin has already been set up for this platform. 
          Contact them if you need admin access.
        </p>
        <Button onClick={() => window.location.href = "/"} data-testid="button-go-home">
          Go to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-lg" data-testid="setup-card">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Shield className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Platform Setup</CardTitle>
          <CardDescription>
            Initialize the Future of Work simulation platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <p className="font-medium">You will become the Super Admin</p>
            <p className="text-sm text-muted-foreground">
              As Super Admin, you will have full control over:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Creating organizations for classes/cohorts</li>
              <li>Generating team codes for student registration</li>
              <li>Promoting professors to Class Admin role</li>
              <li>Platform-wide settings and configuration</li>
            </ul>
          </div>

          <div className="bg-blue-500/10 p-4 rounded-lg">
            <p className="text-sm">
              <strong>Logged in as:</strong> {user.firstName} {user.lastName}
            </p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>

          <Button 
            className="w-full" 
            size="lg"
            onClick={handleInitialize}
            disabled={isInitializing || initializeMutation.isPending}
            data-testid="button-initialize"
          >
            {isInitializing || initializeMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Initialize as Super Admin
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            This action can only be performed once. Make sure you're logged in with the correct account.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
