import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { X, Eye, GraduationCap, Users, Loader2 } from "lucide-react";
import { startEducatorTour, startMultiPageStudentTour, resetEducatorTourProgress, resetStudentTourProgress, waitForElement } from "@/lib/demo-tour";
import { useDemoTour } from "./demo-tour-provider";

interface PreviewBannerProps {
  previewRole: string;
  previewOrgId: string;
  orgName?: string;
}

export function PreviewBanner({ previewRole, previewOrgId, orgName }: PreviewBannerProps) {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const { showCtaModal } = useDemoTour();

  const exitMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/preview/exit", {});
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["/api/my-role"] }),
        queryClient.refetchQueries({ queryKey: ["/api/auth/user"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/demo/preview/status"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/team"] }),
      ]);
      toast({ title: "Preview ended", description: "Back to your normal view" });
      setLocation("/super-admin");
    },
    onError: (error: any) => {
      toast({ title: "Error exiting preview", description: error.message, variant: "destructive" });
    },
  });

  const handleStartEducatorTour = async () => {
    if (previewOrgId && !location.includes(`org=${previewOrgId}`)) {
      setLocation(`/class-admin?org=${previewOrgId}`);
      try {
        await waitForElement('[data-testid="tab-students"], [data-testid="tab-simulation"]', 5000);
        resetEducatorTourProgress();
        startEducatorTour(() => {}, () => {});
      } catch (e) {
        resetEducatorTourProgress();
        startEducatorTour(() => {}, () => {});
      }
    } else {
      resetEducatorTourProgress();
      startEducatorTour(() => {}, () => {});
    }
  };

  const handleStartStudentTour = async () => {
    await queryClient.invalidateQueries({ queryKey: ["/api/team"] });
    await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });

    setLocation("/");

    try {
      await waitForElement('[data-testid="dashboard-page"]', 10000);
    } catch {
      toast({
        title: "Could not load student dashboard",
        description: "Make sure a test team exists for this organization.",
        variant: "destructive",
      });
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    resetStudentTourProgress();
    await startMultiPageStudentTour(setLocation, () => {}, () => {});
  };

  const roleLabel = previewRole === "educator" ? "Educator" : "Student";
  const roleIcon = previewRole === "educator" ? GraduationCap : Users;
  const RoleIcon = roleIcon;

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-[100] bg-blue-600 dark:bg-blue-700 text-white shadow-lg"
      data-testid="preview-banner"
    >
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Eye className="h-4 w-4" />
          <span className="font-medium text-sm">
            Preview Mode
          </span>
          <Badge variant="secondary" className="text-xs" data-testid="badge-preview-role">
            <RoleIcon className="h-3 w-3 mr-1" />
            {roleLabel}
          </Badge>
          {orgName && (
            <span className="text-xs text-blue-200" data-testid="text-preview-org">
              {orgName}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {previewRole === "educator" && (
            <Button 
              size="sm" 
              variant="secondary"
              onClick={handleStartEducatorTour}
              data-testid="button-educator-tour"
            >
              <GraduationCap className="h-3 w-3 mr-1" />
              Guided Educator Tour
            </Button>
          )}
          {previewRole === "student" && (
            <Button 
              size="sm" 
              variant="secondary"
              onClick={handleStartStudentTour}
              data-testid="button-student-tour"
            >
              <Users className="h-3 w-3 mr-1" />
              Guided Student Tour
            </Button>
          )}
          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => exitMutation.mutate()}
            disabled={exitMutation.isPending}
            data-testid="button-exit-preview"
          >
            {exitMutation.isPending ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <X className="h-3 w-3 mr-1" />
            )}
            Exit Preview
          </Button>
        </div>
      </div>
    </div>
  );
}
