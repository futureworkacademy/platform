import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { MetricCard } from "@/components/metric-card";
import { Link, useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DollarSign,
  Users,
  Heart,
  Factory,
  Banknote,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertCircle,
  Clock,
  AlertTriangle,
  UserCheck,
  Building2,
  BookOpen,
  Eye,
  X,
  RotateCw,
  GraduationCap,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoTooltip, TOOLTIP_CONTENT } from "@/components/info-tooltip";
import type { Team } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const { data: team, isLoading, error } = useQuery<Team>({
    queryKey: ["/api/team"],
  });

  const { data: userInfo } = useQuery<{ 
    previewRole?: string | null;
    previewOrgId?: string | null;
    inStudentPreview?: boolean;
    isClassAdmin?: boolean;
    isSuperAdmin?: boolean;
    previewModeOrgId?: string | null;
    organizations?: Array<{ id: string; name: string }>;
  }>({
    queryKey: ["/api/my-role"],
  });

  const isInPreviewMode = !!userInfo?.previewRole || userInfo?.inStudentPreview === true;
  const adminOrgId = userInfo?.previewOrgId || userInfo?.previewModeOrgId || userInfo?.organizations?.[0]?.id;

  const exitPreviewModeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/preview/exit", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-role"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Exited preview mode", description: "Returning to admin view" });
      setLocation("/super-admin");
    },
    onError: (error: any) => {
      toast({ title: "Error exiting preview mode", description: error.message, variant: "destructive" });
    },
  });

  const resetTestDataMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/class-admin/organizations/${adminOrgId}/preview-mode/reset`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      toast({ title: "Test data reset", description: "The simulation has been reset to week 1" });
    },
    onError: (error: any) => {
      toast({ title: "Error resetting test data", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error || !team) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8" data-testid="dashboard-page">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Unable to load dashboard</h2>
        <p className="text-muted-foreground text-center max-w-md">
          There was an error loading your team data. Please try refreshing the page.
        </p>
      </div>
    );
  }

  const { companyState, currentWeek, totalWeeks, weeklyHistory } = team;

  const workforceRatio = companyState.employees / 2400;
  const financialScore = Math.round((companyState.revenue / 125000000) * workforceRatio * 100);
  const culturalScore = Math.round((companyState.morale + (100 - companyState.unionSentiment) + companyState.workforceAdaptability) / 3);
  const combinedScore = Math.round((financialScore + culturalScore) / 2);

  const lastWeek = weeklyHistory.length > 0 ? weeklyHistory[weeklyHistory.length - 1] : null;
  
  const getTrend = (current: number, previous: number | undefined) => {
    if (!previous) return "stable";
    return current > previous ? "up" : current < previous ? "down" : "stable";
  };

  const getDelta = (current: number, previous: number | undefined): number | null => {
    if (previous === undefined) return null;
    return current - previous;
  };

  const lastFinancialScore = lastWeek?.financialScore ?? null;
  const lastCulturalScore = lastWeek?.culturalScore ?? null;
  const financialDelta = getDelta(financialScore, lastFinancialScore ?? undefined);
  const culturalDelta = getDelta(culturalScore, lastCulturalScore ?? undefined);
  const combinedDelta = financialDelta !== null && culturalDelta !== null ? Math.round((financialDelta + culturalDelta) / 2) : null;

  const debtToEquity = companyState.debt / (companyState.cash + 10000000);
  const unionRiskLevel = companyState.unionSentiment >= 75 ? "critical" : companyState.unionSentiment >= 50 ? "high" : companyState.unionSentiment >= 30 ? "medium" : "low";

  return (
    <div className="p-6 space-y-6" data-testid="dashboard-page">
      {/* Preview Mode Banner */}
      {isInPreviewMode && (
        <Alert className="bg-amber-500/10 border-amber-500" data-testid="preview-mode-banner">
          <Eye className="h-4 w-4 text-amber-500" />
          <AlertDescription className="flex items-center justify-between gap-4 flex-wrap">
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              You are viewing the simulation as a test student. Actions you take here won't affect real students.
            </span>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => resetTestDataMutation.mutate()}
                disabled={resetTestDataMutation.isPending}
                data-testid="button-reset-test-data"
              >
                <RotateCw className={`mr-1 h-3 w-3 ${resetTestDataMutation.isPending ? 'animate-spin' : ''}`} />
                Reset Progress
              </Button>
              <Button 
                size="sm" 
                onClick={() => exitPreviewModeMutation.mutate()}
                disabled={exitPreviewModeMutation.isPending}
                data-testid="button-exit-preview"
              >
                <X className="mr-1 h-3 w-3" />
                Exit Preview
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Executive Dashboard</h1>
          <p className="text-muted-foreground">
            {team.name} | Week {currentWeek} of {totalWeeks}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant={team.difficultyLevel === "advanced" ? "default" : team.difficultyLevel === "standard" ? "secondary" : "outline"} 
                className="flex items-center gap-1.5 px-3 py-1.5 cursor-help"
                data-testid="badge-difficulty-level"
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span className="capitalize">{team.difficultyLevel || "Advanced"}</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="font-semibold mb-1">
                {team.difficultyLevel === "introductory" ? "Introductory Level" : 
                 team.difficultyLevel === "standard" ? "Standard Level" : "Advanced Level"}
              </p>
              <p className="text-xs text-muted-foreground">
                {team.difficultyLevel === "introductory" 
                  ? "Undergraduate level with encouraging evaluation. More advisor uses, lower event probability."
                  : team.difficultyLevel === "standard"
                  ? "Corporate training level with balanced evaluation. Moderate complexity and scoring thresholds."
                  : "Graduate/MBA level with rigorous evaluation. Full stakeholder complexity, limited advisor uses."}
              </p>
            </TooltipContent>
          </Tooltip>
          <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span className="font-mono">{totalWeeks - currentWeek} weeks remaining</span>
          </Badge>
        </div>
      </div>

      <Card className="border-warning/40 bg-warning/5" data-testid="card-next-action">
        <CardContent className="flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-md bg-warning/10">
              <ArrowRight className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm font-semibold text-warning tracking-wide uppercase">Action Required</p>
              <p className="text-xs text-muted-foreground">Review this week's intelligence briefing and make your decisions</p>
            </div>
          </div>
          <Button asChild size="lg" className="bg-warning text-white border border-warning/70 shadow-sm" data-testid="button-start-week">
            <Link href="/briefing">
              Start Week {currentWeek}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Revenue"
          value={`$${(companyState.revenue / 1000000).toFixed(1)}M`}
          subtitle="Annual revenue"
          trend={getTrend(companyState.revenue, lastWeek?.revenue)}
          icon={<DollarSign className="h-4 w-4" />}
          variant="default"
        />
        <MetricCard
          title="Employees"
          value={companyState.employees.toLocaleString()}
          subtitle="Total workforce"
          trend={getTrend(companyState.employees, lastWeek?.employees)}
          icon={<Users className="h-4 w-4" />}
          variant="default"
        />
        <MetricCard
          title="Employee Morale"
          value={`${companyState.morale}%`}
          subtitle="Sentiment index"
          trend={getTrend(companyState.morale, lastWeek?.morale)}
          icon={<Heart className="h-4 w-4" />}
          variant={companyState.morale >= 70 ? "success" : companyState.morale >= 50 ? "warning" : "danger"}
        />
        <MetricCard
          title="Total Debt"
          value={`$${(companyState.debt / 1000000).toFixed(1)}M`}
          subtitle={`${(companyState.debtInterestRate * 100).toFixed(1)}% interest`}
          icon={<Banknote className="h-4 w-4" />}
          variant={companyState.debt > 10000000 ? "danger" : companyState.debt > 5000000 ? "warning" : "default"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
            <CardTitle className="text-base font-semibold">Performance Scores</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/leaderboard">
                View Leaderboard <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/10" data-testid="financial-score-card">
                <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground mb-2">
                  Financial Score
                  <InfoTooltip content={TOOLTIP_CONTENT.financialScore} iconSize={12} />
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="text-3xl font-bold font-mono text-primary" data-testid="financial-score">
                    {financialScore}
                  </div>
                  {financialDelta !== null && financialDelta !== 0 && (
                    <div className={`flex items-center text-sm font-mono ${financialDelta > 0 ? 'text-success' : 'text-destructive'}`}>
                      {financialDelta > 0 ? <TrendingUp className="h-4 w-4 mr-0.5" /> : <TrendingDown className="h-4 w-4 mr-0.5" />}
                      {financialDelta > 0 ? '+' : ''}{financialDelta}
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Revenue × Workforce
                </div>
                <div className="text-xs text-muted-foreground/60 mt-0.5">
                  Range: 0 - 150
                </div>
              </div>
              <div className="text-center p-4 rounded-lg bg-success/5 border border-success/10" data-testid="cultural-score-card">
                <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground mb-2">
                  Cultural Score
                  <InfoTooltip content={TOOLTIP_CONTENT.culturalHealth} iconSize={12} />
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="text-3xl font-bold font-mono text-success" data-testid="cultural-score">
                    {culturalScore}
                  </div>
                  {culturalDelta !== null && culturalDelta !== 0 && (
                    <div className={`flex items-center text-sm font-mono ${culturalDelta > 0 ? 'text-success' : 'text-destructive'}`}>
                      {culturalDelta > 0 ? <TrendingUp className="h-4 w-4 mr-0.5" /> : <TrendingDown className="h-4 w-4 mr-0.5" />}
                      {culturalDelta > 0 ? '+' : ''}{culturalDelta}
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Morale + Stability
                </div>
                <div className="text-xs text-muted-foreground/60 mt-0.5">
                  Range: 0 - 100
                </div>
              </div>
              <div className="text-center p-4 rounded-lg bg-accent/5 border border-accent/10" data-testid="combined-score-card">
                <div className="text-sm text-muted-foreground mb-2">Combined Score</div>
                <div className="flex items-center justify-center gap-2">
                  <div className="text-3xl font-bold font-mono text-accent-foreground" data-testid="combined-score">
                    {combinedScore}
                  </div>
                  {combinedDelta !== null && combinedDelta !== 0 && (
                    <div className={`flex items-center text-sm font-mono ${combinedDelta > 0 ? 'text-success' : 'text-destructive'}`}>
                      {combinedDelta > 0 ? <TrendingUp className="h-4 w-4 mr-0.5" /> : <TrendingDown className="h-4 w-4 mr-0.5" />}
                      {combinedDelta > 0 ? '+' : ''}{combinedDelta}
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Overall Performance
                </div>
                <div className="text-xs text-muted-foreground/60 mt-0.5">
                  Range: 0 - 125
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Risk Indicators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <AlertTriangle className={`h-4 w-4 ${
                    unionRiskLevel === 'critical' ? 'text-destructive' :
                    unionRiskLevel === 'high' ? 'text-destructive/80' :
                    unionRiskLevel === 'medium' ? 'text-warning' : 'text-success'
                  }`} />
                  Union Sentiment
                  <InfoTooltip content={TOOLTIP_CONTENT.unionSentiment} iconSize={12} />
                </span>
                <Badge variant={
                  unionRiskLevel === 'critical' ? 'destructive' :
                  unionRiskLevel === 'high' ? 'default' : 'secondary'
                }>
                  {companyState.unionSentiment}% {companyState.unionized && '(Unionized)'}
                </Badge>
              </div>
              <Progress value={companyState.unionSentiment} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Factory className="h-4 w-4 text-primary" />
                  Automation Level
                  <InfoTooltip content={TOOLTIP_CONTENT.automationROI} iconSize={12} />
                </span>
                <span className="font-mono">{companyState.automationLevel}%</span>
              </div>
              <Progress value={companyState.automationLevel} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-accent" />
                  Management Bench
                  <InfoTooltip content={TOOLTIP_CONTENT.managementBench} iconSize={12} />
                </span>
                <span className="font-mono">{companyState.managementBenchStrength}%</span>
              </div>
              <Progress value={companyState.managementBenchStrength} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  Workforce Adaptability
                </span>
                <span className="font-mono">{companyState.workforceAdaptability}%</span>
              </div>
              <Progress value={companyState.workforceAdaptability} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Factory className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Automation ROI</div>
                <div className="text-lg font-mono font-bold">{companyState.automationROI}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-success/10 text-success">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Reskilling Progress</div>
                <div className="text-lg font-mono font-bold">{companyState.reskillingProgress}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/10 text-accent">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Gen Z Workforce</div>
                <div className="text-lg font-mono font-bold">{companyState.genZWorkforcePercentage}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-warning/10 text-warning">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Manager Vacancies</div>
                <div className="text-lg font-mono font-bold">{companyState.managerVacancies}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Financial Position</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-md bg-muted/50 border">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-success/10 text-success">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-medium">Cash on Hand</div>
                  <div className="text-xs text-muted-foreground">Available liquidity</div>
                </div>
              </div>
              <div className="text-lg font-mono font-bold">
                ${(companyState.cash / 1000000).toFixed(1)}M
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-md bg-muted/50 border">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                  <Banknote className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-medium">Outstanding Debt</div>
                  <div className="text-xs text-muted-foreground">{(companyState.debtInterestRate * 100).toFixed(1)}% annual interest</div>
                </div>
              </div>
              <div className="text-lg font-mono font-bold">
                ${(companyState.debt / 1000000).toFixed(1)}M
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-md bg-muted/50 border">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-warning/10 text-warning">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-medium">Debt-to-Equity Ratio</div>
                  <div className="text-xs text-muted-foreground">Financial leverage</div>
                </div>
              </div>
              <div className={`text-lg font-mono font-bold ${debtToEquity > 1 ? 'text-destructive' : debtToEquity > 0.5 ? 'text-warning' : 'text-success'}`}>
                {debtToEquity.toFixed(2)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" asChild data-testid="button-briefing">
              <Link href="/briefing">
                <BookOpen className="h-4 w-4 mr-3" />
                View Weekly Briefing
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild data-testid="button-decisions">
              <Link href="/decisions">
                <TrendingUp className="h-4 w-4 mr-3" />
                Make Strategic Decisions
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild data-testid="button-analytics">
              <Link href="/analytics">
                <Users className="h-4 w-4 mr-3" />
                People Analytics
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild data-testid="button-leaderboard">
              <Link href="/leaderboard">
                <Building2 className="h-4 w-4 mr-3" />
                View Leaderboard
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6" data-testid="dashboard-page">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
