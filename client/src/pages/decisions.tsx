import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { DepartmentCard } from "@/components/department-card";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import {
  Cpu,
  Shield,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  DollarSign,
  Zap,
  RefreshCw,
} from "lucide-react";
import type { Team, Department, InsertDecision } from "@shared/schema";

export default function Decisions() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [lobbyingSpend, setLobbyingSpend] = useState(0);
  const [reskillingSpend, setReskillingSpend] = useState(0);
  const [deployingDept, setDeployingDept] = useState<string | null>(null);

  const { data: team, isLoading: teamLoading } = useQuery<Team>({
    queryKey: ["/api/team"],
  });

  const { data: departments, isLoading: deptsLoading } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const deployMutation = useMutation({
    mutationFn: async (departmentId: string) => {
      const decision: InsertDecision = {
        weekNumber: team!.currentWeek,
        type: "ai_deployment",
        departmentId,
      };
      return apiRequest("POST", "/api/decisions", decision);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      toast({
        title: "AI Deployed Successfully",
        description: "The AI system has been deployed to the department.",
      });
      setDeployingDept(null);
    },
    onError: () => {
      toast({
        title: "Deployment Failed",
        description: "There was an error deploying the AI system.",
        variant: "destructive",
      });
      setDeployingDept(null);
    },
  });

  const lobbyMutation = useMutation({
    mutationFn: async (amount: number) => {
      const decision: InsertDecision = {
        weekNumber: team!.currentWeek,
        type: "lobbying",
        lobbyingSpend: amount,
      };
      return apiRequest("POST", "/api/decisions", decision);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      toast({
        title: "Lobbying Successful",
        description: "Your lobbying efforts may influence future events.",
      });
      setLobbyingSpend(0);
    },
    onError: () => {
      toast({
        title: "Lobbying Failed",
        description: "There was an error processing your lobbying decision.",
        variant: "destructive",
      });
    },
  });

  const reskillMutation = useMutation({
    mutationFn: async (amount: number) => {
      const decision: InsertDecision = {
        weekNumber: team!.currentWeek,
        type: "reskilling",
        reskillingSpend: amount,
      };
      return apiRequest("POST", "/api/decisions", decision);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      toast({
        title: "Reskilling Investment",
        description: "Employees are being retrained with new skills.",
      });
      setReskillingSpend(0);
    },
    onError: () => {
      toast({
        title: "Reskilling Failed",
        description: "There was an error processing your reskilling decision.",
        variant: "destructive",
      });
    },
  });

  const advanceWeekMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/advance-week", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      queryClient.invalidateQueries({ queryKey: ["/api/briefing"] });
      toast({
        title: "Week Complete",
        description: "Advancing to the next week...",
      });
      navigate("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to advance to the next week.",
        variant: "destructive",
      });
    },
  });

  const handleDeploy = (departmentId: string) => {
    setDeployingDept(departmentId);
    deployMutation.mutate(departmentId);
  };

  if (teamLoading || deptsLoading) {
    return <DecisionsSkeleton />;
  }

  if (!team || !departments) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Unable to load decisions</h2>
        <p className="text-muted-foreground text-center max-w-md">
          There was an error loading the decision interface. Please try refreshing the page.
        </p>
      </div>
    );
  }

  const { companyState } = team;
  const estimatedCosts = departments.map(() => 
    Math.floor(Math.random() * 50000) + 50000
  );

  return (
    <div className="p-6 space-y-6" data-testid="decisions-page">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="font-mono">
              Week {team.currentWeek}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Strategic Decisions</h1>
          <p className="text-muted-foreground">
            Allocate resources and deploy AI systems across your organization
          </p>
        </div>
        <Button
          onClick={() => advanceWeekMutation.mutate()}
          disabled={advanceWeekMutation.isPending}
          data-testid="button-complete-week"
        >
          {advanceWeekMutation.isPending ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Complete Week {team.currentWeek}
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">AI Budget</div>
              <div className="text-xl font-mono font-bold">
                ${(companyState.aiBudget / 1000).toFixed(0)}K
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-success/5 border-success/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Reskilling Fund</div>
              <div className="text-xl font-mono font-bold">
                ${(companyState.reskillingFund / 1000).toFixed(0)}K
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-warning/5 border-warning/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10 text-warning">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Lobbying Budget</div>
              <div className="text-xl font-mono font-bold">
                ${(companyState.lobbyingBudget / 1000).toFixed(0)}K
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">AI Deployment Options</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map((dept, index) => (
              <DepartmentCard
                key={dept.id}
                department={dept}
                onDeploy={() => handleDeploy(dept.id)}
                isDeploying={deployingDept === dept.id}
                aiBudget={companyState.aiBudget}
                estimatedCost={estimatedCosts[index]}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-warning" />
            <h2 className="text-lg font-semibold">Resource Allocation</h2>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-warning" />
                Lobbying Investment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Invest in lobbying to influence policy and mitigate negative events.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Investment Amount</span>
                  <span className="font-mono font-semibold">
                    ${(lobbyingSpend / 1000).toFixed(0)}K
                  </span>
                </div>
                <Slider
                  value={[lobbyingSpend]}
                  onValueChange={([value]) => setLobbyingSpend(value)}
                  max={Math.min(companyState.lobbyingBudget, 20000)}
                  step={1000}
                  className="py-2"
                  data-testid="slider-lobbying"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>$0</span>
                  <span>${(Math.min(companyState.lobbyingBudget, 20000) / 1000).toFixed(0)}K max</span>
                </div>
              </div>
              <Button
                className="w-full"
                variant="outline"
                disabled={lobbyingSpend === 0 || lobbyMutation.isPending}
                onClick={() => lobbyMutation.mutate(lobbyingSpend)}
                data-testid="button-lobby"
              >
                {lobbyMutation.isPending ? "Processing..." : "Invest in Lobbying"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-success" />
                Employee Reskilling
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Invest in training to prepare employees for AI-augmented roles.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Investment Amount</span>
                  <span className="font-mono font-semibold">
                    ${(reskillingSpend / 1000).toFixed(0)}K
                  </span>
                </div>
                <Slider
                  value={[reskillingSpend]}
                  onValueChange={([value]) => setReskillingSpend(value)}
                  max={Math.min(companyState.reskillingFund, 50000)}
                  step={5000}
                  className="py-2"
                  data-testid="slider-reskilling"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>$0</span>
                  <span>${(Math.min(companyState.reskillingFund, 50000) / 1000).toFixed(0)}K max</span>
                </div>
              </div>
              <Button
                className="w-full"
                variant="outline"
                disabled={reskillingSpend === 0 || reskillMutation.isPending}
                onClick={() => reskillMutation.mutate(reskillingSpend)}
                data-testid="button-reskill"
              >
                {reskillMutation.isPending ? "Processing..." : "Invest in Reskilling"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>
                  Decisions made this week will affect your company's performance 
                  and employee sentiment. Choose wisely!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DecisionsSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Skeleton className="h-5 w-24 mb-2" />
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    </div>
  );
}
