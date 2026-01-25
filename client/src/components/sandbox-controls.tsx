import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { X, RotateCw, ChevronLeft, ChevronRight, FlaskConical } from "lucide-react";

interface SandboxControlsProps {
  orgId: string;
  currentWeek: number;
}

export function SandboxControls({ orgId, currentWeek }: SandboxControlsProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedWeek, setSelectedWeek] = useState(currentWeek.toString());

  const invalidateAndRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/team"] });
    queryClient.invalidateQueries({ queryKey: ["/api/briefing"] });
    queryClient.invalidateQueries({ queryKey: ["/api/decisions"] });
    queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
    queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    queryClient.invalidateQueries({ queryKey: ["/api/class-admin/organizations", orgId, "preview-mode"] });
    setLocation("/dashboard");
  };

  const setWeekMutation = useMutation({
    mutationFn: async (week: number) => {
      return apiRequest("POST", `/api/class-admin/organizations/${orgId}/preview-mode/set-week`, { week });
    },
    onSuccess: (_, week) => {
      toast({ title: "Week changed", description: `Now viewing Week ${week}` });
      invalidateAndRefresh();
    },
    onError: (error: any) => {
      toast({ title: "Error changing week", description: error.message, variant: "destructive" });
    },
  });

  const exitMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/class-admin/organizations/${orgId}/preview-mode/exit`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/class-admin/organizations", orgId, "preview-mode"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Exited sandbox mode", description: "Back to admin view" });
      setLocation(`/class-admin?org=${orgId}`);
    },
    onError: (error: any) => {
      toast({ title: "Error exiting sandbox", description: error.message, variant: "destructive" });
    },
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/class-admin/organizations/${orgId}/preview-mode/reset`, {});
    },
    onSuccess: () => {
      toast({ title: "Sandbox reset", description: "All data reset to Week 1" });
      setSelectedWeek("1");
      invalidateAndRefresh();
    },
    onError: (error: any) => {
      toast({ title: "Error resetting sandbox", description: error.message, variant: "destructive" });
    },
  });

  const handleWeekChange = (newWeek: string) => {
    setSelectedWeek(newWeek);
    setWeekMutation.mutate(parseInt(newWeek));
  };

  const handlePrevWeek = () => {
    const prev = Math.max(1, currentWeek - 1);
    setSelectedWeek(prev.toString());
    setWeekMutation.mutate(prev);
  };

  const handleNextWeek = () => {
    const next = Math.min(8, currentWeek + 1);
    setSelectedWeek(next.toString());
    setWeekMutation.mutate(next);
  };

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 bg-amber-500 dark:bg-amber-600 rounded-lg shadow-lg px-3 py-1.5 flex items-center gap-2" 
      data-testid="sandbox-controls"
    >
      <FlaskConical className="h-4 w-4 text-white" />
      <span className="font-medium text-xs text-white">Sandbox</span>
      
      <div className="h-3 w-px bg-white/30" />
      
      <div className="flex items-center gap-0.5">
        <Button 
          size="icon" 
          variant="secondary"
          className="h-6 w-6"
          onClick={handlePrevWeek}
          disabled={currentWeek <= 1 || setWeekMutation.isPending}
          data-testid="button-prev-week"
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>
        
        <Select value={selectedWeek} onValueChange={handleWeekChange} disabled={setWeekMutation.isPending}>
          <SelectTrigger className="w-[70px] h-6 text-xs" data-testid="select-week">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Week 1</SelectItem>
            <SelectItem value="2">Week 2</SelectItem>
            <SelectItem value="3">Week 3</SelectItem>
            <SelectItem value="4">Week 4</SelectItem>
            <SelectItem value="5">Week 5</SelectItem>
            <SelectItem value="6">Week 6</SelectItem>
            <SelectItem value="7">Week 7</SelectItem>
            <SelectItem value="8">Week 8</SelectItem>
          </SelectContent>
        </Select>
        
        <Button 
          size="icon" 
          variant="secondary"
          className="h-6 w-6"
          onClick={handleNextWeek}
          disabled={currentWeek >= 8 || setWeekMutation.isPending}
          data-testid="button-next-week"
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="h-3 w-px bg-white/30" />
      
      <Button 
        size="sm" 
        variant="secondary"
        className="h-6 text-xs px-2"
        onClick={() => resetMutation.mutate()}
        disabled={resetMutation.isPending}
        data-testid="button-reset-sandbox"
      >
        <RotateCw className={`h-3 w-3 mr-1 ${resetMutation.isPending ? 'animate-spin' : ''}`} />
        Reset
      </Button>
      
      <Button 
        size="sm" 
        variant="secondary"
        className="h-6 text-xs px-2"
        onClick={() => exitMutation.mutate()}
        disabled={exitMutation.isPending}
        data-testid="button-exit-sandbox"
      >
        <X className="h-3 w-3 mr-1" />
        Exit
      </Button>
    </div>
  );
}
