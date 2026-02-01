import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { X, Eye, GraduationCap, Users, Loader2 } from "lucide-react";
import { startInstructorTour, startDashboardTour, resetInstructorTourProgress, resetStudentTourProgress, waitForElement } from "@/lib/demo-tour";

interface DemoPreviewControlsProps {
  demoOrgId?: string | null;
}

export function DemoPreviewControls({ demoOrgId }: DemoPreviewControlsProps) {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  const exitMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/demo/preview/exit", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/demo/preview/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-role"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Exited demo preview", description: "Back to super admin view" });
      setLocation("/super-admin");
    },
    onError: (error: any) => {
      toast({ title: "Error exiting demo preview", description: error.message, variant: "destructive" });
    },
  });

  // Enter sandbox mode to start the student tour
  const enterSandboxMutation = useMutation({
    mutationFn: async () => {
      if (!demoOrgId) throw new Error("No demo org available");
      return apiRequest("POST", `/api/class-admin/organizations/${demoOrgId}/preview-mode/enter`, { startWeek: 1 });
    },
    onSuccess: async () => {
      // Invalidate all relevant queries for sandbox mode
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      queryClient.invalidateQueries({ queryKey: ["/api/class-admin/organizations", demoOrgId, "preview-mode"] });
      
      // Navigate to dashboard
      setLocation("/dashboard");
      
      // Wait for dashboard to render before starting tour
      try {
        await waitForElement('[data-testid="financial-score"], [data-testid="button-start-week"]', 5000);
        resetStudentTourProgress();
        startDashboardTour();
      } catch (e) {
        // Dashboard loaded but elements not found - start tour anyway
        resetStudentTourProgress();
        startDashboardTour();
      }
    },
    onError: (error: any) => {
      toast({ title: "Error starting student tour", description: error.message, variant: "destructive" });
    },
  });

  const handleStartInstructorTour = async () => {
    if (demoOrgId && !location.includes(`org=${demoOrgId}`)) {
      setLocation(`/class-admin?org=${demoOrgId}`);
      // Wait for class admin page to render before starting tour
      try {
        await waitForElement('[data-testid="tab-students"], [data-testid="tab-simulation"]', 5000);
        resetInstructorTourProgress();
        startInstructorTour();
      } catch (e) {
        // Page loaded but elements not found - start tour anyway
        resetInstructorTourProgress();
        startInstructorTour();
      }
    } else {
      resetInstructorTourProgress();
      startInstructorTour();
    }
  };

  const handleStartStudentTour = () => {
    if (demoOrgId) {
      enterSandboxMutation.mutate();
    } else {
      toast({ 
        title: "Demo org not available", 
        description: "Unable to start student tour - demo organization not found." ,
        variant: "destructive"
      });
    }
  };

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 bg-blue-600 dark:bg-blue-700 rounded-lg shadow-lg px-4 py-2 flex flex-col gap-2" 
      data-testid="demo-preview-controls"
    >
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4 text-white" />
        <span className="font-medium text-sm text-white">Evaluator Preview</span>
        
        <div className="flex-1" />
        
        <Button 
          size="sm" 
          variant="secondary"
          onClick={() => exitMutation.mutate()}
          disabled={exitMutation.isPending}
          data-testid="button-exit-demo-preview"
        >
          <X className="h-3 w-3 mr-1" />
          Exit Preview
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          size="sm" 
          variant="secondary"
          onClick={handleStartInstructorTour}
          data-testid="button-instructor-tour"
        >
          <GraduationCap className="h-3 w-3 mr-1" />
          Instructor Tour
        </Button>
        
        <Button 
          size="sm" 
          variant="secondary"
          onClick={handleStartStudentTour}
          disabled={enterSandboxMutation.isPending}
          data-testid="button-student-tour"
        >
          {enterSandboxMutation.isPending ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <Users className="h-3 w-3 mr-1" />
          )}
          {enterSandboxMutation.isPending ? "Loading..." : "Student Tour"}
        </Button>
      </div>
    </div>
  );
}
