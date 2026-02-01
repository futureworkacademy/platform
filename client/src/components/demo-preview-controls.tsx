import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { X, Eye } from "lucide-react";

export function DemoPreviewControls() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

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

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 bg-blue-600 dark:bg-blue-700 rounded-lg shadow-lg px-3 py-1.5 flex items-center gap-2" 
      data-testid="demo-preview-controls"
    >
      <Eye className="h-4 w-4 text-white" />
      <span className="font-medium text-xs text-white">Evaluator Preview</span>
      
      <div className="h-3 w-px bg-white/30" />
      
      <span className="text-xs text-white/80">Viewing as evaluator would see</span>
      
      <div className="h-3 w-px bg-white/30" />
      
      <Button 
        size="sm" 
        variant="secondary"
        className="h-6 text-xs px-2"
        onClick={() => exitMutation.mutate()}
        disabled={exitMutation.isPending}
        data-testid="button-exit-demo-preview"
      >
        <X className="h-3 w-3 mr-1" />
        Exit Preview
      </Button>
    </div>
  );
}
