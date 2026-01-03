import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PeopleAnalytics } from "@shared/schema";

interface AnalyticsChartsProps {
  analytics: PeopleAnalytics;
}

export function SentimentHeatmap({ analytics }: AnalyticsChartsProps) {
  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 70) return "bg-success";
    if (sentiment >= 50) return "bg-warning";
    return "bg-destructive";
  };

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-success" />;
      case "down":
        return <TrendingDown className="h-3 w-3 text-destructive" />;
      default:
        return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
  };

  return (
    <Card data-testid="sentiment-heatmap">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Sentiment by Department</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {analytics.sentimentByDepartment.map((dept) => (
          <div key={dept.department} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{dept.department}</span>
              <div className="flex items-center gap-2">
                {getTrendIcon(dept.trend)}
                <span
                  className={cn(
                    "font-mono text-sm font-semibold",
                    dept.sentiment >= 70
                      ? "text-success"
                      : dept.sentiment >= 50
                      ? "text-warning"
                      : "text-destructive"
                  )}
                >
                  {dept.sentiment}%
                </span>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn("h-full transition-all duration-500", getSentimentColor(dept.sentiment))}
                style={{ width: `${dept.sentiment}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function IssueTracker({ analytics }: AnalyticsChartsProps) {
  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card data-testid="issue-tracker">
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-base font-semibold">Key Issues</CardTitle>
          <Badge variant="outline" className="font-mono">
            {analytics.keyIssues.length} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {analytics.keyIssues.map((issue) => (
          <div
            key={issue.id}
            className="flex items-start gap-3 p-3 rounded-md bg-muted/50 border"
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full shrink-0",
                issue.priority === "high"
                  ? "bg-destructive/20 text-destructive"
                  : issue.priority === "medium"
                  ? "bg-warning/20 text-warning"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">{issue.issue}</span>
                <Badge
                  variant="outline"
                  className={cn("text-xs capitalize", getPriorityColor(issue.priority))}
                >
                  {issue.priority}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-xs text-muted-foreground">
                  {issue.category}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {issue.affectedEmployees} affected
                </span>
              </div>
            </div>
          </div>
        ))}
        {analytics.keyIssues.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">
            No active issues detected
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function BehaviorTrends({ analytics }: AnalyticsChartsProps) {
  const data = analytics.behaviorTrends.map((trend) => ({
    week: `W${trend.week}`,
    Productivity: trend.productivity,
    Engagement: trend.engagement,
    "Turnover Risk": trend.turnoverRisk,
  }));

  return (
    <Card data-testid="behavior-trends">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Behavior Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="week" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="Productivity"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="Engagement"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="Turnover Risk"
                stroke="hsl(var(--chart-5))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-5))", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-chart-1" />
            <span className="text-xs text-muted-foreground">Productivity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-chart-2" />
            <span className="text-xs text-muted-foreground">Engagement</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-chart-5" />
            <span className="text-xs text-muted-foreground">Turnover Risk</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function EmployeeSegments({ analytics }: AnalyticsChartsProps) {
  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  const totalEmployees = analytics.employeeSegments.reduce((sum, seg) => sum + seg.count, 0);

  return (
    <Card data-testid="employee-segments">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Employee Segments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className="h-40 w-40 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.employeeSegments}
                  dataKey="count"
                  nameKey="segment"
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={60}
                  paddingAngle={2}
                >
                  {analytics.employeeSegments.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-3">
            {analytics.employeeSegments.map((segment, index) => (
              <div key={segment.segment} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm">{segment.segment}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-mono">
                    {segment.count} ({((segment.count / totalEmployees) * 100).toFixed(0)}%)
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-mono",
                      segment.avgMorale >= 70
                        ? "text-success border-success/30"
                        : segment.avgMorale >= 50
                        ? "text-warning border-warning/30"
                        : "text-destructive border-destructive/30"
                    )}
                  >
                    {segment.avgMorale}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PerformanceChart({ weeklyHistory }: { weeklyHistory: Array<{ week: number; revenue: number; morale: number; financialScore: number; culturalScore: number }> }) {
  const data = weeklyHistory.map((h) => ({
    week: `W${h.week}`,
    Financial: h.financialScore,
    Cultural: h.culturalScore,
  }));

  return (
    <Card data-testid="performance-chart">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Performance Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="week" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="Financial" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Cultural" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-chart-1" />
            <span className="text-xs text-muted-foreground">Financial Score</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-chart-2" />
            <span className="text-xs text-muted-foreground">Cultural Score</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
