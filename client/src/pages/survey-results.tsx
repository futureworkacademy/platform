import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  BarChart3,
  Brain,
  MessageSquare,
  Star,
  TrendingUp,
  Users,
  Calendar,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
} from "recharts";

const WEEK_TITLES: Record<number, string> = {
  1: "The Automation Imperative",
  2: "The Talent Pipeline Crisis",
  3: "Union Storm Brewing",
  4: "The First Displacement",
  5: "The Manager Exodus",
  6: "Debt Day of Reckoning",
  7: "The Competitive Response",
  8: "Strategic Direction",
};

const CATEGORIES = [
  { key: "realism", label: "Realism", color: "#1e3a5f" },
  { key: "fairness", label: "Fairness", color: "#22c55e" },
  { key: "difficulty", label: "Difficulty", color: "#f59e0b" },
  { key: "learningValue", label: "Learning Value", color: "#3b82f6" },
  { key: "engagement", label: "Engagement", color: "#ef4444" },
  { key: "clarity", label: "Clarity", color: "#8b5cf6" },
  { key: "selfEfficacy", label: "Self-Efficacy", color: "#ec4899" },
  { key: "transferConfidence", label: "Transfer Confidence", color: "#14b8a6" },
  { key: "productiveStruggle", label: "Productive Struggle", color: "#f97316" },
];

const CORE_CATEGORIES = CATEGORIES.slice(0, 6);
const OUTCOME_CATEGORIES = CATEGORIES.slice(6);

interface SurveyResponse {
  weekNumber: number;
  realism: number;
  fairness: number;
  difficulty: number;
  learningValue: number;
  engagement: number;
  clarity: number;
  selfEfficacy: number | null;
  transferConfidence: number | null;
  productiveStruggle: number | null;
  comments: string | null;
  studentId: string;
  createdAt: string;
}

function avgRating(responses: SurveyResponse[]): number {
  if (responses.length === 0) return 0;
  return (
    responses.reduce(
      (s, r) =>
        s +
        (r.realism + r.fairness + r.difficulty + r.learningValue + r.engagement + r.clarity) / 6,
      0
    ) / responses.length
  );
}

function outcomeAvg(responses: SurveyResponse[], key: string): number | null {
  const vals = responses.filter((r: any) => r[key] != null).map((r: any) => r[key] as number);
  if (vals.length === 0) return null;
  return Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10;
}

function getAvgBadgeColor(val: number): string {
  if (val >= 4) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  if (val >= 3) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
}

export default function SurveyResultsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ responses: SurveyResponse[] }>({
    queryKey: ["/api/survey/results"],
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/survey/analyze", { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error("Failed to analyze");
      return res.json();
    },
    onSuccess: (data: { analysis: string }) => {
      setAnalysisResult(data.analysis);
    },
  });

  if (!user) return null;

  const responses = data?.responses || [];

  const weekGroups: Record<number, SurveyResponse[]> = {};
  for (const r of responses) {
    if (!weekGroups[r.weekNumber]) weekGroups[r.weekNumber] = [];
    weekGroups[r.weekNumber].push(r);
  }
  const weeks = Object.keys(weekGroups)
    .map(Number)
    .sort((a, b) => a - b);

  const uniqueStudents = new Set(responses.map((r) => r.studentId)).size;
  const overallAvg = avgRating(responses);

  const trendData = weeks.map((w) => {
    const wrs = weekGroups[w];
    const entry: Record<string, number | string> = { week: `W${w}` };
    for (const cat of CORE_CATEGORIES) {
      entry[cat.key] = Math.round((wrs.reduce((s, r: any) => s + r[cat.key], 0) / wrs.length) * 10) / 10;
    }
    for (const cat of OUTCOME_CATEGORIES) {
      const vals = wrs.filter((r: any) => r[cat.key] != null);
      if (vals.length > 0) {
        entry[cat.key] = Math.round((vals.reduce((s: number, r: any) => s + r[cat.key], 0) / vals.length) * 10) / 10;
      }
    }
    return entry;
  });

  const radarData = CORE_CATEGORIES.map((cat) => ({
    category: cat.label,
    value:
      responses.length > 0
        ? Math.round((responses.reduce((s, r: any) => s + r[cat.key], 0) / responses.length) * 10) / 10
        : 0,
  }));

  const hasOutcomeData = responses.some((r) => r.selfEfficacy != null || r.transferConfidence != null || r.productiveStruggle != null);

  const distData = [0, 0, 0, 0, 0];
  for (const r of responses) {
    for (const cat of CORE_CATEGORIES) {
      distData[(r as any)[cat.key] - 1]++;
    }
  }
  const distributionData = distData.map((count, i) => ({
    rating: `${i + 1} Star${i === 0 ? "" : "s"}`,
    count,
  }));
  const distColors = ["#ef4444", "#f59e0b", "#fbbf24", "#3b82f6", "#22c55e"];

  const allComments = responses
    .filter((r) => r.comments?.trim())
    .sort((a, b) => a.weekNumber - b.weekNumber);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/super-admin")}
              data-testid="btn-back-admin"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground" data-testid="page-title">
                Survey Results Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Student feedback analysis across all simulation weeks
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            Admin Only
          </Badge>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 rounded-lg" />
            ))}
          </div>
        ) : responses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Survey Responses Yet</h3>
              <p className="text-muted-foreground text-sm">
                Student feedback will appear here once students start submitting surveys at{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">/survey</code>
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4" data-testid="overview-stats">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold font-mono text-primary" data-testid="stat-total">
                    {responses.length}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Total Responses</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold font-mono text-primary" data-testid="stat-weeks">
                    {weeks.length}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Weeks Covered</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold font-mono text-primary" data-testid="stat-avg">
                    {overallAvg.toFixed(1)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Overall Average</p>
                  <p className="text-xs text-muted-foreground">across all categories</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold font-mono text-primary" data-testid="stat-students">
                    {uniqueStudents}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Unique Students</p>
                </CardContent>
              </Card>
            </div>

            <Card data-testid="chart-trends">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4" />
                  Rating Trends Across Weeks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
                    <Tooltip />
                    <Legend />
                    {CORE_CATEGORIES.map((cat) => (
                      <Line
                        key={cat.key}
                        type="monotone"
                        dataKey={cat.key}
                        name={cat.label}
                        stroke={cat.color}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    ))}
                    {hasOutcomeData && OUTCOME_CATEGORIES.map((cat) => (
                      <Line
                        key={cat.key}
                        type="monotone"
                        dataKey={cat.key}
                        name={cat.label}
                        stroke={cat.color}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card data-testid="chart-radar">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Star className="h-4 w-4" />
                    Category Averages (All Weeks)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="category" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis domain={[0, 5]} tickCount={6} />
                      <Radar
                        dataKey="value"
                        stroke="#1e3a5f"
                        fill="#1e3a5f"
                        fillOpacity={0.15}
                        dot={{ r: 4, fill: "#1e3a5f" }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card data-testid="chart-distribution">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart3 className="h-4 w-4" />
                    Response Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={distributionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="rating" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {distributionData.map((_, i) => (
                          <rect key={i} fill={distColors[i]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {hasOutcomeData && (
              <Card data-testid="chart-outcomes">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-4 w-4" />
                    Learning Outcome Indicators
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Optional validated constructs measuring self-efficacy (Bandura, 1997), transfer confidence (Kirkpatrick L3), and productive struggle (Kapur, 2016).
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {OUTCOME_CATEGORIES.map((cat) => {
                      const avg = outcomeAvg(responses, cat.key);
                      const respondents = responses.filter((r: any) => r[cat.key] != null).length;
                      return (
                        <div key={cat.key} className="text-center p-4 rounded-lg border" data-testid={`outcome-${cat.key}`}>
                          <div className="text-2xl font-bold font-mono" style={{ color: cat.color }}>
                            {avg !== null ? avg.toFixed(1) : "—"}
                          </div>
                          <div className="text-sm font-medium mt-1">{cat.label}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {respondents} / {responses.length} responded
                          </div>
                          {avg !== null && (
                            <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-semibold ${getAvgBadgeColor(avg)}`}>
                              {avg >= 4 ? "Strong" : avg >= 3 ? "Moderate" : "Needs Attention"}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card data-testid="trend-table">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4" />
                  Week-by-Week Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Week</th>
                        {CORE_CATEGORIES.map((cat) => (
                          <th key={cat.key} className="text-center py-2 px-2 text-muted-foreground font-medium text-xs">
                            {cat.label}
                          </th>
                        ))}
                        <th className="text-center py-2 px-2 text-muted-foreground font-medium text-xs">Avg</th>
                        <th className="text-center py-2 px-2 text-muted-foreground font-medium text-xs">N</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weeks.map((w) => {
                        const wrs = weekGroups[w];
                        let rowTotal = 0;
                        return (
                          <tr key={w} className="border-b last:border-0">
                            <td className="py-2 px-3">
                              <span className="font-semibold">W{w}</span>
                              <br />
                              <span className="text-xs text-muted-foreground">{WEEK_TITLES[w] || ""}</span>
                            </td>
                            {CORE_CATEGORIES.map((cat) => {
                              const avg = wrs.reduce((s, r: any) => s + r[cat.key], 0) / wrs.length;
                              rowTotal += avg;
                              return (
                                <td key={cat.key} className="text-center py-2 px-2">
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold font-mono ${getAvgBadgeColor(avg)}`}>
                                    {avg.toFixed(1)}
                                  </span>
                                </td>
                              );
                            })}
                            <td className="text-center py-2 px-2">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold font-mono ${getAvgBadgeColor(rowTotal / CORE_CATEGORIES.length)}`}>
                                {(rowTotal / CORE_CATEGORIES.length).toFixed(1)}
                              </span>
                            </td>
                            <td className="text-center py-2 px-2 text-muted-foreground">{wrs.length}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="ai-analysis">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Brain className="h-4 w-4" />
                  AI-Powered Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!analysisResult && !analyzeMutation.isPending && (
                  <div className="text-center py-6">
                    <Sparkles className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Generate an AI analysis of all survey responses to identify trends, strengths, and areas for improvement.
                    </p>
                    <Button onClick={() => analyzeMutation.mutate()} data-testid="btn-analyze">
                      <Brain className="mr-2 h-4 w-4" />
                      Analyze Feedback
                    </Button>
                  </div>
                )}
                {analyzeMutation.isPending && (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary mb-3" />
                    <p className="text-sm text-muted-foreground">Analyzing survey data...</p>
                  </div>
                )}
                {analysisResult && (
                  <div className="prose prose-sm max-w-none dark:prose-invert" data-testid="analysis-content">
                    {analysisResult.split("\n").map((line, i) => {
                      if (line.startsWith("## ")) return <h3 key={i} className="text-base font-semibold mt-4 mb-2">{line.replace("## ", "")}</h3>;
                      if (line.startsWith("### ")) return <h4 key={i} className="text-sm font-semibold mt-3 mb-1">{line.replace("### ", "")}</h4>;
                      if (line.startsWith("**") && line.endsWith("**")) return <h4 key={i} className="text-sm font-semibold mt-3 mb-1">{line.replace(/\*\*/g, "")}</h4>;
                      if (line.startsWith("- ") || line.startsWith("* ")) return <li key={i} className="ml-4 text-sm text-muted-foreground">{line.replace(/^[-*] /, "").replace(/\*\*(.*?)\*\*/g, "$1")}</li>;
                      if (line.trim() === "") return <br key={i} />;
                      return <p key={i} className="text-sm text-muted-foreground mb-1">{line.replace(/\*\*(.*?)\*\*/g, "$1")}</p>;
                    })}
                    <div className="mt-4 pt-4 border-t">
                      <Button variant="outline" size="sm" onClick={() => analyzeMutation.mutate()} data-testid="btn-reanalyze">
                        <Brain className="mr-2 h-3 w-3" />
                        Re-analyze
                      </Button>
                    </div>
                  </div>
                )}
                {analyzeMutation.isError && (
                  <p className="text-sm text-destructive text-center py-4">
                    Failed to analyze. Please try again.
                  </p>
                )}
              </CardContent>
            </Card>

            {allComments.length > 0 && (
              <Card data-testid="comments-section">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageSquare className="h-4 w-4" />
                    Student Comments ({allComments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {allComments.map((r, i) => (
                    <div
                      key={i}
                      className="bg-muted/50 border rounded-lg p-3"
                      data-testid={`comment-${i}`}
                    >
                      <div className="text-xs text-muted-foreground mb-1">
                        Week {r.weekNumber}: {WEEK_TITLES[r.weekNumber] || ""} — Student {r.studentId}
                      </div>
                      <p className="text-sm">{r.comments}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
