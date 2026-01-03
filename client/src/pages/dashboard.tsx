import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MetricCard } from "@/components/metric-card";
import { ScoreGauge } from "@/components/score-gauge";
import { PerformanceChart } from "@/components/analytics-charts";
import { Link } from "wouter";
import {
  DollarSign,
  Users,
  Heart,
  Cpu,
  BookOpen,
  Shield,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  Clock,
} from "lucide-react";
import type { Team } from "@shared/schema";

export default function Dashboard() {
  const { data: team, isLoading, error } = useQuery<Team>({
    queryKey: ["/api/team"],
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error || !team) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Unable to load dashboard</h2>
        <p className="text-muted-foreground text-center max-w-md">
          There was an error loading your team data. Please try refreshing the page.
        </p>
      </div>
    );
  }

  const { companyState, currentWeek, totalWeeks, weeklyHistory } = team;

  const financialScore = (companyState.revenue / 1000000) * (companyState.employees / 500);
  const culturalScore = companyState.morale / 100;
  const combinedScore = financialScore * culturalScore;

  const lastWeek = weeklyHistory.length > 0 ? weeklyHistory[weeklyHistory.length - 1] : null;
  const revenueTrend = lastWeek
    ? companyState.revenue > lastWeek.revenue
      ? "up"
      : companyState.revenue < lastWeek.revenue
      ? "down"
      : "stable"
    : "stable";
  const employeeTrend = lastWeek
    ? companyState.employees > lastWeek.employees
      ? "up"
      : companyState.employees < lastWeek.employees
      ? "down"
      : "stable"
    : "stable";
  const moraleTrend = lastWeek
    ? companyState.morale > lastWeek.morale
      ? "up"
      : companyState.morale < lastWeek.morale
      ? "down"
      : "stable"
    : "stable";

  return (
    <div className="p-6 space-y-6" data-testid="dashboard-page">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Executive Dashboard</h1>
          <p className="text-muted-foreground">
            Apex Manufacturing Inc. | Week {currentWeek} of {totalWeeks}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span className="font-mono">{totalWeeks - currentWeek} weeks remaining</span>
          </Badge>
          <Button asChild data-testid="button-start-week">
            <Link href="/briefing">
              <BookOpen className="h-4 w-4 mr-2" />
              Start Week {currentWeek}
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Revenue"
          value={`$${(companyState.revenue / 1000000).toFixed(2)}M`}
          subtitle="Annual revenue"
          trend={revenueTrend}
          trendValue={
            lastWeek
              ? `${(((companyState.revenue - lastWeek.revenue) / lastWeek.revenue) * 100).toFixed(1)}%`
              : undefined
          }
          icon={<DollarSign className="h-4 w-4" />}
          variant={revenueTrend === "up" ? "success" : revenueTrend === "down" ? "danger" : "default"}
        />
        <MetricCard
          title="Employees"
          value={companyState.employees.toLocaleString()}
          subtitle="Total workforce"
          trend={employeeTrend}
          trendValue={
            lastWeek
              ? `${companyState.employees - lastWeek.employees > 0 ? "+" : ""}${companyState.employees - lastWeek.employees}`
              : undefined
          }
          icon={<Users className="h-4 w-4" />}
          variant={employeeTrend === "up" ? "success" : employeeTrend === "down" ? "warning" : "default"}
        />
        <MetricCard
          title="Employee Morale"
          value={`${companyState.morale}%`}
          subtitle="Sentiment index"
          trend={moraleTrend}
          trendValue={
            lastWeek
              ? `${companyState.morale - lastWeek.morale > 0 ? "+" : ""}${companyState.morale - lastWeek.morale}`
              : undefined
          }
          icon={<Heart className="h-4 w-4" />}
          variant={
            companyState.morale >= 70
              ? "success"
              : companyState.morale >= 50
              ? "warning"
              : "danger"
          }
        />
        <MetricCard
          title="AI Budget"
          value={`$${(companyState.aiBudget / 1000).toFixed(0)}K`}
          subtitle="Available for deployment"
          icon={<Cpu className="h-4 w-4" />}
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
              <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/10">
                <div className="text-sm text-muted-foreground mb-2">Financial Score</div>
                <div className="text-3xl font-bold font-mono text-primary" data-testid="financial-score">
                  {financialScore.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Revenue × Workforce
                </div>
              </div>
              <div className="text-center p-4 rounded-lg bg-success/5 border border-success/10">
                <div className="text-sm text-muted-foreground mb-2">Cultural Score</div>
                <div className="text-3xl font-bold font-mono text-success" data-testid="cultural-score">
                  {culturalScore.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Employee Sentiment
                </div>
              </div>
              <div className="text-center p-4 rounded-lg bg-accent/5 border border-accent/10">
                <div className="text-sm text-muted-foreground mb-2">Combined Score</div>
                <div className="text-3xl font-bold font-mono text-accent" data-testid="combined-score">
                  {combinedScore.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Overall Performance
                </div>
              </div>
            </div>
            <ScoreGauge
              label="Overall Company Health"
              value={companyState.morale}
              color={
                companyState.morale >= 70
                  ? "success"
                  : companyState.morale >= 50
                  ? "warning"
                  : "danger"
              }
              size="lg"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Available Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-md bg-muted/50 border">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-medium">AI Budget</div>
                  <div className="text-xs text-muted-foreground">For AI deployments</div>
                </div>
              </div>
              <div className="text-lg font-mono font-bold">
                ${(companyState.aiBudget / 1000).toFixed(0)}K
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-md bg-muted/50 border">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-success/10 text-success">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-medium">Reskilling Fund</div>
                  <div className="text-xs text-muted-foreground">Employee training</div>
                </div>
              </div>
              <div className="text-lg font-mono font-bold">
                ${(companyState.reskillingFund / 1000).toFixed(0)}K
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-md bg-muted/50 border">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-warning/10 text-warning">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-medium">Lobbying Budget</div>
                  <div className="text-xs text-muted-foreground">Policy influence</div>
                </div>
              </div>
              <div className="text-lg font-mono font-bold">
                ${(companyState.lobbyingBudget / 1000).toFixed(0)}K
              </div>
            </div>
            <Button className="w-full" asChild data-testid="button-make-decisions">
              <Link href="/decisions">
                <TrendingUp className="h-4 w-4 mr-2" />
                Make Decisions
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {weeklyHistory.length > 0 && (
        <PerformanceChart weeklyHistory={weeklyHistory} />
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
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
