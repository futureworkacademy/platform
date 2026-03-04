import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SentimentHeatmap,
  IssueTracker,
  BehaviorTrends,
  EmployeeSegments,
} from "@/components/analytics-charts";
import { AlertCircle, BarChart3, TrendingUp, Users, Heart } from "lucide-react";
import type { PeopleAnalytics, Team } from "@shared/schema";

export default function Analytics() {
  const { data: team } = useQuery<Team>({
    queryKey: ["/api/team"],
  });

  const { data: analytics, isLoading, error } = useQuery<PeopleAnalytics>({
    queryKey: ["/api/analytics"],
  });

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  if (error || !analytics || !team) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8" data-testid="analytics-page">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Unable to load analytics</h2>
        <p className="text-muted-foreground text-center max-w-md">
          There was an error loading the people analytics data. Please try refreshing the page.
        </p>
      </div>
    );
  }

  const avgSentiment =
    analytics.sentimentByDepartment.reduce((sum, d) => sum + d.sentiment, 0) /
    analytics.sentimentByDepartment.length;

  const totalEmployees = analytics.employeeSegments.reduce((sum, s) => sum + s.count, 0);
  const highPriorityIssues = analytics.keyIssues.filter((i) => i.priority === "high").length;

  const latestTrend = analytics.behaviorTrends[analytics.behaviorTrends.length - 1];

  return (
    <div className="p-6 space-y-6" data-testid="analytics-page">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="font-mono">
            Week {team.currentWeek}
          </Badge>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">People Analytics</h1>
        <p className="text-muted-foreground">
          Deep insights into employee sentiment, behavior patterns, and emerging workplace issues
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Avg. Sentiment</div>
              <div className="text-xl font-mono font-bold" data-testid="avg-sentiment">
                {avgSentiment.toFixed(1)}%
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Employees</div>
              <div className="text-xl font-mono font-bold" data-testid="total-employees">
                {totalEmployees}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Critical Issues</div>
              <div className="text-xl font-mono font-bold" data-testid="critical-issues">
                {highPriorityIssues}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10 text-warning">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Turnover Risk</div>
              <div className="text-xl font-mono font-bold" data-testid="turnover-risk">
                {latestTrend?.turnoverRisk ?? 0}%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SentimentHeatmap analytics={analytics} />
        <IssueTracker analytics={analytics} />
      </div>

      <BehaviorTrends analytics={analytics} />

      <EmployeeSegments analytics={analytics} />
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="p-6 space-y-6" data-testid="analytics-page">
      <div>
        <Skeleton className="h-5 w-24 mb-2" />
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
      <Skeleton className="h-80" />
      <Skeleton className="h-64" />
    </div>
  );
}
