import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { MetricCard } from "@/components/metric-card";
import { Link } from "wouter";
import {
  DollarSign,
  Users,
  Heart,
  Factory,
  Banknote,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  Clock,
  AlertTriangle,
  UserCheck,
  Building2,
  BookOpen,
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

  const workforceRatio = companyState.employees / 2400;
  const financialScore = Math.round((companyState.revenue / 125000000) * workforceRatio * 100);
  const culturalScore = Math.round((companyState.morale + (100 - companyState.unionSentiment) + companyState.workforceAdaptability) / 3);
  const combinedScore = Math.round((financialScore + culturalScore) / 2);

  const lastWeek = weeklyHistory.length > 0 ? weeklyHistory[weeklyHistory.length - 1] : null;
  
  const getTrend = (current: number, previous: number | undefined) => {
    if (!previous) return "stable";
    return current > previous ? "up" : current < previous ? "down" : "stable";
  };

  const debtToEquity = companyState.debt / (companyState.cash + 10000000);
  const unionRiskLevel = companyState.unionSentiment >= 75 ? "critical" : companyState.unionSentiment >= 50 ? "high" : companyState.unionSentiment >= 30 ? "medium" : "low";

  return (
    <div className="p-6 space-y-6" data-testid="dashboard-page">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Executive Dashboard</h1>
          <p className="text-muted-foreground">
            {team.name} | Week {currentWeek} of {totalWeeks}
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
              <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/10">
                <div className="text-sm text-muted-foreground mb-2">Financial Score</div>
                <div className="text-3xl font-bold font-mono text-primary" data-testid="financial-score">
                  {financialScore}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Revenue × Workforce
                </div>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-500/5 border border-green-500/10">
                <div className="text-sm text-muted-foreground mb-2">Cultural Score</div>
                <div className="text-3xl font-bold font-mono text-green-400" data-testid="cultural-score">
                  {culturalScore}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Morale + Stability
                </div>
              </div>
              <div className="text-center p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
                <div className="text-sm text-muted-foreground mb-2">Combined Score</div>
                <div className="text-3xl font-bold font-mono text-blue-400" data-testid="combined-score">
                  {combinedScore}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Overall Performance
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
                    unionRiskLevel === 'critical' ? 'text-red-400' :
                    unionRiskLevel === 'high' ? 'text-orange-400' :
                    unionRiskLevel === 'medium' ? 'text-yellow-400' : 'text-green-400'
                  }`} />
                  Union Sentiment
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
                  <Factory className="h-4 w-4 text-blue-400" />
                  Automation Level
                </span>
                <span className="font-mono">{companyState.automationLevel}%</span>
              </div>
              <Progress value={companyState.automationLevel} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-purple-400" />
                  Management Bench
                </span>
                <span className="font-mono">{companyState.managementBenchStrength}%</span>
              </div>
              <Progress value={companyState.managementBenchStrength} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
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
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-500/10 text-blue-400">
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
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-green-500/10 text-green-400">
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
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-purple-500/10 text-purple-400">
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
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-orange-500/10 text-orange-400">
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
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-green-500/10 text-green-400">
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
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-red-500/10 text-red-400">
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
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-yellow-500/10 text-yellow-400">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-medium">Debt-to-Equity Ratio</div>
                  <div className="text-xs text-muted-foreground">Financial leverage</div>
                </div>
              </div>
              <div className={`text-lg font-mono font-bold ${debtToEquity > 1 ? 'text-red-400' : debtToEquity > 0.5 ? 'text-yellow-400' : 'text-green-400'}`}>
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
