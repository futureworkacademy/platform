import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  Cpu,
  BookOpen,
  ChevronRight,
  CheckCircle2,
  Clock,
  BarChart3,
  PieChartIcon,
  ArrowRight,
  AlertTriangle,
  FlaskConical,
  Home,
  Newspaper,
} from "lucide-react";
import type { Team, ResearchReport, HistoricalData, WorkforceDemographics } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SandboxControls } from "@/components/sandbox-controls";
import { InfoTooltip, TOOLTIP_CONTENT } from "@/components/info-tooltip";

const CHART_COLORS = ["hsl(35, 100%, 50%)", "hsl(142, 76%, 50%)", "hsl(200, 100%, 60%)", "hsl(280, 80%, 65%)", "hsl(0, 72%, 55%)"];

export default function Research() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  
  const inSandboxMode = (user?.previewRole as string | null) === "student" || user?.inStudentPreview === true;

  const { data: team, isLoading: teamLoading } = useQuery<Team>({
    queryKey: ["/api/team"],
  });

  const { data: reports, isLoading: reportsLoading } = useQuery<ResearchReport[]>({
    queryKey: ["/api/research/reports"],
  });

  const { data: historicalData, isLoading: histLoading } = useQuery<HistoricalData[]>({
    queryKey: ["/api/research/historical"],
  });

  const { data: workforce, isLoading: workforceLoading } = useQuery<WorkforceDemographics>({
    queryKey: ["/api/research/workforce"],
  });

  const markViewedMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const response = await apiRequest("POST", `/api/research/mark-viewed/${reportId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
    },
  });

  const completeResearchMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/team/complete-research");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to complete research");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      toast({
        title: "Research Complete",
        description: "You can now begin Week 1 of the simulation.",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Cannot Proceed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const viewedReports = new Set(team?.viewedReportIds || []);

  // Redirect to setup if not complete - use effect to avoid setState during render
  // Skip this redirect when in sandbox mode - admin should see full student experience
  useEffect(() => {
    if (team && !team.setupComplete && !inSandboxMode) {
      setLocation("/setup");
    }
  }, [team, setLocation, inSandboxMode]);

  const handleReportView = (reportId: string) => {
    setSelectedReport(reportId);
    if (!viewedReports.has(reportId)) {
      markViewedMutation.mutate(reportId);
    }
  };

  const downloadCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map(row => headers.map(h => JSON.stringify(row[h] ?? "")).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadResearchAsPDF = () => {
    const content = reports?.map(report => {
      const keyFindings = report.keyFindings.map((f, i) => `   ${i + 1}. ${f}`).join("\n");
      const dataPoints = report.dataPoints?.map(dp => `   - ${dp.label}: ${dp.value}`).join("\n") || "";
      
      return `
================================================================================
${report.title.toUpperCase()}
================================================================================
Category: ${report.category.replace("_", " ")} | Published: ${report.publishedDate} | Reading Time: ${report.readingTime} min

SUMMARY
${report.summary}

CONTENT
${report.content}

KEY FINDINGS
${keyFindings}
${dataPoints ? `\nDATA POINTS\n${dataPoints}` : ""}
`;
    }).join("\n\n");

    const fullDocument = `
THE FUTURE OF WORK - RESEARCH MATERIALS
Apex Manufacturing Inc. Business Simulation
Generated: ${new Date().toLocaleDateString()}
Team: ${team?.name || "Unknown"}

================================================================================
TABLE OF CONTENTS
================================================================================
${reports?.map((r, i) => `${i + 1}. ${r.title} (${r.category.replace("_", " ")})`).join("\n")}

${content}

================================================================================
END OF RESEARCH MATERIALS
================================================================================
`;

    const blob = new Blob([fullDocument], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "research_materials.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (teamLoading || reportsLoading || histLoading || workforceLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="animate-pulse text-primary">Loading Research Center...</div>
        </div>
      </div>
    );
  }

  // In sandbox mode, allow viewing even if setupComplete is false
  if (!team?.setupComplete && !inSandboxMode) {
    return null;
  }

  const totalReports = reports?.length || 0;
  const viewedCount = viewedReports.size;
  const researchProgress = totalReports > 0 ? (viewedCount / totalReports) * 100 : 0;
  const canProceed = researchProgress >= 50;

  const currentReport = reports?.find(r => r.id === selectedReport);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "industry": return <BarChart3 className="h-4 w-4" />;
      case "company": return <Building2 className="h-4 w-4" />;
      case "workforce": return <Users className="h-4 w-4" />;
      case "technology": return <Cpu className="h-4 w-4" />;
      case "competition": return <TrendingUp className="h-4 w-4" />;
      case "case_study": return <BookOpen className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "industry": return "bg-blue-500/10 text-blue-500";
      case "company": return "bg-primary/10 text-primary";
      case "workforce": return "bg-purple-500/10 text-purple-500";
      case "technology": return "bg-cyan-500/10 text-cyan-500";
      case "competition": return "bg-amber-500/10 text-amber-500";
      case "case_study": return "bg-emerald-500/10 text-emerald-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="research-page">
      {/* Sandbox Mode Banner - Prominent at top */}
      {inSandboxMode && (
        <div className="bg-amber-500 text-black py-3 px-4" data-testid="sandbox-banner">
          <div className="container mx-auto flex items-center justify-center gap-3">
            <FlaskConical className="h-5 w-5" />
            <span className="font-semibold text-lg">SANDBOX MODE - Previewing Student Experience</span>
            <FlaskConical className="h-5 w-5" />
          </div>
        </div>
      )}
      <div className={`border-b bg-card ${inSandboxMode ? 'border-amber-500/50' : ''}`}>
        <div className="container mx-auto px-6 py-4">
          {/* Navigation breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Home className="w-3 h-3" />
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Research Center</span>
            <span>/</span>
            <Link href="/briefing" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Newspaper className="w-3 h-3" />
              Intelligence Briefing
            </Link>
          </div>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Research Center</h1>
                <p className="text-sm text-muted-foreground">{team?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="flex items-center justify-end gap-1 text-sm text-muted-foreground">
                  Research Progress
                  <InfoTooltip content={TOOLTIP_CONTENT.researchProgress} iconSize={12} side="left" />
                </p>
                <div className="flex items-center gap-2">
                  <Progress value={researchProgress} className="w-32 h-2" />
                  <span className="text-sm font-mono">{Math.round(researchProgress)}%</span>
                </div>
              </div>
              {!inSandboxMode && (
                <Button 
                  onClick={() => completeResearchMutation.mutate()}
                  disabled={!canProceed || completeResearchMutation.isPending}
                  data-testid="button-start-simulation"
                >
                  {completeResearchMutation.isPending ? "Starting..." : (
                    <>
                      Begin Simulation
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {!canProceed && (
          <Card className="mb-6 border-warning/50 bg-warning/5">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <p className="text-sm">
                  Review at least 50% of the research materials to unlock the simulation. 
                  Current progress: {Math.round(researchProgress)}%
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-xl">
            <TabsTrigger value="reports" data-testid="tab-reports">
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="historical" data-testid="tab-historical">
              <BarChart3 className="h-4 w-4 mr-2" />
              Historical
            </TabsTrigger>
            <TabsTrigger value="workforce" data-testid="tab-workforce">
              <Users className="h-4 w-4 mr-2" />
              Workforce
            </TabsTrigger>
            <TabsTrigger value="downloads" data-testid="tab-downloads">
              <Download className="h-4 w-4 mr-2" />
              Downloads
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-4">
            <h2 className="text-lg font-semibold text-center">Intelligence Reports</h2>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
                  {reports?.map((report) => (
                    <Card 
                      key={report.id}
                      className={`cursor-pointer transition-all hover-elevate ${
                        selectedReport === report.id ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => handleReportView(report.id)}
                      data-testid={`report-card-${report.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className={getCategoryColor(report.category)}>
                                {getCategoryIcon(report.category)}
                                <span className="ml-1 capitalize">{report.category.replace("_", " ")}</span>
                              </Badge>
                              {viewedReports.has(report.id) && (
                                <CheckCircle2 className="h-4 w-4 text-success" />
                              )}
                            </div>
                            <h3 className="font-medium text-sm leading-tight">{report.title}</h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {report.readingTime} min read
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>

              <div className="lg:col-span-2">
                {currentReport ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className={getCategoryColor(currentReport.category)}>
                          {getCategoryIcon(currentReport.category)}
                          <span className="ml-1 capitalize">{currentReport.category.replace("_", " ")}</span>
                        </Badge>
                        <span className="text-xs text-muted-foreground">{currentReport.publishedDate}</span>
                      </div>
                      <CardTitle>{currentReport.title}</CardTitle>
                      <CardDescription>{currentReport.summary}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="text-muted-foreground whitespace-pre-wrap">{currentReport.content}</p>
                      </div>

                      {currentReport.dataPoints && currentReport.dataPoints.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {currentReport.dataPoints.map((dp, i) => (
                            <Card key={i} className="bg-muted/50">
                              <CardContent className="p-3">
                                <p className="text-xs text-muted-foreground">{dp.label}</p>
                                <div className="flex items-center gap-1">
                                  <span className="text-lg font-mono font-bold">{dp.value}</span>
                                  {dp.trend === "up" && <TrendingUp className="h-4 w-4 text-success" />}
                                  {dp.trend === "down" && <TrendingDown className="h-4 w-4 text-destructive" />}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}

                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-3">Key Findings</h4>
                        <ul className="space-y-2">
                          {currentReport.keyFindings.map((finding, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                              {finding}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-[600px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select a report to view its contents</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="historical" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue & Employee Trends (5 Year History)</CardTitle>
                  <CardDescription>Quarterly performance metrics for strategic analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="quarter" 
                          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        />
                        <YAxis 
                          yAxisId="left"
                          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                          tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`}
                        />
                        <YAxis 
                          yAxisId="right"
                          orientation="right"
                          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--card))", 
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px"
                          }}
                        />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="revenue" stroke={CHART_COLORS[0]} name="Revenue" strokeWidth={2} />
                        <Line yAxisId="right" type="monotone" dataKey="employees" stroke={CHART_COLORS[1]} name="Employees" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Investment vs. Operating Margin</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={historicalData?.slice(-8)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="quarter" 
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                          />
                          <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: "hsl(var(--card))", 
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px"
                            }}
                          />
                          <Legend />
                          <Bar dataKey="aiInvestment" fill={CHART_COLORS[2]} name="AI Investment ($K)" />
                          <Bar dataKey="operatingMargin" fill={CHART_COLORS[3]} name="Op. Margin (%)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Employee vs. Customer Satisfaction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={historicalData?.slice(-8)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="quarter" 
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                          />
                          <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: "hsl(var(--card))", 
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px"
                            }}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="employeeSatisfaction" stroke={CHART_COLORS[1]} name="Employee Sat." strokeWidth={2} />
                          <Line type="monotone" dataKey="customerSatisfaction" stroke={CHART_COLORS[0]} name="Customer Sat." strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="workforce" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Department Analysis</CardTitle>
                  <CardDescription>Headcount, tenure, and AI exposure risk by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Department</th>
                          <th className="text-right py-3 px-4 font-medium">Headcount</th>
                          <th className="text-right py-3 px-4 font-medium">Avg Tenure</th>
                          <th className="text-right py-3 px-4 font-medium">Avg Age</th>
                          <th className="text-center py-3 px-4 font-medium">AI Exposure Risk</th>
                          <th className="text-center py-3 px-4 font-medium">Reskilling Potential</th>
                        </tr>
                      </thead>
                      <tbody>
                        {workforce?.departments.map((dept, i) => (
                          <tr key={i} className="border-b last:border-0">
                            <td className="py-3 px-4 font-medium">{dept.name}</td>
                            <td className="text-right py-3 px-4 font-mono">{dept.headcount}</td>
                            <td className="text-right py-3 px-4 font-mono">{dept.avgTenure.toFixed(1)} yrs</td>
                            <td className="text-right py-3 px-4 font-mono">{dept.avgAge}</td>
                            <td className="text-center py-3 px-4">
                              <Badge variant={dept.aiExposureRisk > 70 ? "destructive" : dept.aiExposureRisk > 40 ? "secondary" : "outline"}>
                                {dept.aiExposureRisk}%
                              </Badge>
                            </td>
                            <td className="text-center py-3 px-4">
                              <Badge variant={dept.reskillingPotential > 70 ? "default" : "secondary"}>
                                {dept.reskillingPotential}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Skill Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={workforce?.skillDistribution}
                            dataKey="percentage"
                            nameKey="skill"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={({ skill, percentage }) => `${skill}: ${percentage}%`}
                          >
                            {workforce?.skillDistribution.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                      {workforce?.skillDistribution.map((skill, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span>{skill.skill}</span>
                          <Badge variant={skill.demandTrend === "growing" ? "default" : skill.demandTrend === "declining" ? "destructive" : "secondary"}>
                            {skill.demandTrend}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tenure Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={workforce?.tenureDistribution} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                          <YAxis dataKey="range" type="category" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} width={80} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: "hsl(var(--card))", 
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px"
                            }}
                          />
                          <Bar dataKey="count" fill={CHART_COLORS[0]} name="Employees" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="downloads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Complete Research Package</CardTitle>
                <CardDescription>
                  Download all research materials as a single document for offline review
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Card className="hover-elevate cursor-pointer border-primary/50" onClick={downloadResearchAsPDF} data-testid="button-download-all-research">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Download All Research Materials</p>
                        <p className="text-xs text-muted-foreground">Complete document with all reports, findings, and data</p>
                      </div>
                      <Download className="h-5 w-5 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Download Data for External Analysis</CardTitle>
                <CardDescription>
                  Export datasets in CSV format for use with Excel, Python, R, or other analysis tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="hover-elevate cursor-pointer" onClick={() => historicalData && downloadCSV(historicalData, "historical_performance")}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <BarChart3 className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Historical Performance</p>
                          <p className="text-xs text-muted-foreground">5 years quarterly data</p>
                        </div>
                        <Download className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover-elevate cursor-pointer" onClick={() => workforce?.departments && downloadCSV(workforce.departments, "department_analysis")}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-purple-500/10 text-purple-500">
                          <Users className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Department Analysis</p>
                          <p className="text-xs text-muted-foreground">Headcount & risk metrics</p>
                        </div>
                        <Download className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover-elevate cursor-pointer" onClick={() => workforce?.skillDistribution && downloadCSV(workforce.skillDistribution, "skill_distribution")}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-500">
                          <PieChartIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Skill Distribution</p>
                          <p className="text-xs text-muted-foreground">Skills & demand trends</p>
                        </div>
                        <Download className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Sandbox Controls - Fixed at bottom when in sandbox mode */}
      {inSandboxMode && ((user?.previewOrgId as string | null) || (user?.previewModeOrgId as string | null)) && team && (
        <SandboxControls orgId={((user?.previewOrgId as string | null) || (user?.previewModeOrgId as string | null))!} currentWeek={team.currentWeek || 1} />
      )}
    </div>
  );
}
