import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import {
  AlertTriangle,
  Building2,
  Users,
  TrendingUp,
  MessageSquare,
  ArrowRight,
  Clock,
  Newspaper,
  Target,
  Banknote,
  Factory,
  UserCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import type { Team, WeeklyScenario, WeeklyBriefing } from "@shared/schema";

interface ContentViewProgress {
  briefing: { viewed: number; total: number; percentage: number };
  research: { viewed: number; total: number; percentage: number };
  overall: { viewed: number; total: number; percentage: number };
}

interface ContentView {
  contentType: string;
  contentId: string;
}

function UrgencyBadge({ urgency }: { urgency: string }) {
  const variants: Record<string, string> = {
    critical: "bg-red-500/20 text-red-400 border-red-500/30",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    low: "bg-green-500/20 text-green-400 border-green-500/30",
  };

  return (
    <Badge variant="outline" className={`${variants[urgency] || variants.medium} text-xs uppercase`}>
      {urgency}
    </Badge>
  );
}

export default function Briefing() {
  const queryClient = useQueryClient();
  const viewedSectionsRef = useRef<Set<string>>(new Set());

  const { data: team, isLoading: teamLoading } = useQuery<Team>({
    queryKey: ["/api/team"],
  });

  const { data: scenario, isLoading: scenarioLoading } = useQuery<WeeklyScenario>({
    queryKey: ["/api/scenario", team?.currentWeek],
    enabled: !!team?.currentWeek,
  });

  const { data: briefing, isLoading: briefingLoading } = useQuery<WeeklyBriefing>({
    queryKey: ["/api/briefing", team?.currentWeek],
    enabled: !!team?.currentWeek,
  });

  const { data: contentViews = [] } = useQuery<ContentView[]>({
    queryKey: ["/api/content-views", { contentType: "briefing_section", weekNumber: team?.currentWeek }],
    enabled: !!team?.currentWeek,
  });

  const { data: viewProgress } = useQuery<ContentViewProgress>({
    queryKey: ["/api/content-views/progress", { weekNumber: team?.currentWeek }],
    enabled: !!team?.currentWeek,
  });

  const recordViewMutation = useMutation({
    mutationFn: async (data: { contentType: string; contentId: string; weekNumber: number }) => {
      return apiRequest("POST", "/api/content-views", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content-views"] });
      queryClient.invalidateQueries({ queryKey: ["/api/content-views/progress"] });
    },
  });

  // Track section views as user scrolls/views content
  const recordSectionView = (sectionId: string) => {
    if (!team?.currentWeek || viewedSectionsRef.current.has(sectionId)) return;
    
    // Check if already viewed
    const alreadyViewed = contentViews.some(v => v.contentId === sectionId);
    if (alreadyViewed) {
      viewedSectionsRef.current.add(sectionId);
      return;
    }
    
    viewedSectionsRef.current.add(sectionId);
    recordViewMutation.mutate({
      contentType: "briefing_section",
      contentId: sectionId,
      weekNumber: team.currentWeek,
    });
  };

  // Auto-record view for main scenario when page loads
  useEffect(() => {
    if (scenario && team?.currentWeek) {
      recordSectionView(`scenario-${team.currentWeek}`);
    }
  }, [scenario, team?.currentWeek]);

  const isViewed = (sectionId: string) => {
    return contentViews.some(v => v.contentId === sectionId);
  };

  if (teamLoading || scenarioLoading || briefingLoading) {
    return <BriefingSkeleton />;
  }

  if (!team || !scenario) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">No briefing available</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Unable to load this week's scenario. Please try refreshing.
        </p>
      </div>
    );
  }

  const { companyState } = team;
  const briefingProgress = viewProgress?.briefing?.percentage ?? 0;

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6 max-w-5xl mx-auto" data-testid="briefing-page">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-mono">WEEK {team.currentWeek} OF {team.totalWeeks}</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground" data-testid="text-scenario-title">
              {scenario.title}
            </h1>
          </div>
          <Link href="/decisions">
            <Button data-testid="button-go-to-decisions">
              Make Decisions
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Content viewing progress indicator */}
        <Card className="bg-muted/30">
          <CardContent className="py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Briefing Progress</span>
              </div>
              <div className="flex items-center gap-3 flex-1 max-w-xs">
                <Progress value={briefingProgress} className="h-2" data-testid="progress-briefing" />
                <span className="text-sm font-mono text-muted-foreground min-w-[3rem]" data-testid="text-briefing-progress">
                  {briefingProgress}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-card/50 border-primary/20"
          onMouseEnter={() => recordSectionView(`sitrep-${team.currentWeek}`)}
          data-testid="card-situation-report"
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-primary">
                <Newspaper className="w-5 h-5" />
                <CardTitle className="text-lg">Situation Report</CardTitle>
              </div>
              {isViewed(`sitrep-${team.currentWeek}`) && (
                <CheckCircle2 className="w-4 h-4 text-success" data-testid="icon-sitrep-viewed" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {scenario.narrative.split('\n\n').map((paragraph, i) => (
                <p key={i} className="text-muted-foreground leading-relaxed mb-4" data-testid={`text-narrative-${i}`}>
                  {paragraph}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card 
            onMouseEnter={() => recordSectionView(`pressures-${team.currentWeek}`)}
            data-testid="card-stakeholder-pressures"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-orange-400" />
                  <CardTitle className="text-lg">Stakeholder Pressures</CardTitle>
                </div>
                {isViewed(`pressures-${team.currentWeek}`) && (
                  <CheckCircle2 className="w-4 h-4 text-success" data-testid="icon-pressures-viewed" />
                )}
              </div>
              <CardDescription>Key voices demanding your attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {scenario.pressures.map((pressure, index) => (
                <div key={index} className="space-y-2" data-testid={`card-pressure-${index}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground">{pressure.source}</span>
                    <UrgencyBadge urgency={pressure.urgency} />
                  </div>
                  <p className="text-sm text-muted-foreground italic">"{pressure.message}"</p>
                  {index < scenario.pressures.length - 1 && <Separator className="mt-3" />}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card 
            onMouseEnter={() => recordSectionView(`keyquestion-${team.currentWeek}`)}
            data-testid="card-key-question"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  <CardTitle className="text-lg">Key Question</CardTitle>
                </div>
                {isViewed(`keyquestion-${team.currentWeek}`) && (
                  <CheckCircle2 className="w-4 h-4 text-success" data-testid="icon-keyquestion-viewed" />
                )}
              </div>
              <CardDescription>This week's central challenge</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium text-foreground mb-4" data-testid="text-key-question">
                {scenario.keyQuestion}
              </p>
              
              <Separator className="my-4" />
              
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Company Status</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">Revenue:</span>
                    <span className="font-mono text-foreground">${(companyState.revenue / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">Employees:</span>
                    <span className="font-mono text-foreground">{companyState.employees.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">Morale:</span>
                    <span className="font-mono text-foreground">{companyState.morale}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    <span className="text-muted-foreground">Union Risk:</span>
                    <span className="font-mono text-foreground">{companyState.unionSentiment}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-red-400" />
                    <span className="text-muted-foreground">Debt:</span>
                    <span className="font-mono text-foreground">${(companyState.debt / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Factory className="w-4 h-4 text-blue-400" />
                    <span className="text-muted-foreground">Automation:</span>
                    <span className="font-mono text-foreground">{companyState.automationLevel}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-green-400" />
                    <span className="text-muted-foreground">Mgmt Bench:</span>
                    <span className="font-mono text-foreground">{companyState.managementBenchStrength}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span className="text-muted-foreground">Gen Z:</span>
                    <span className="font-mono text-foreground">{companyState.genZWorkforcePercentage}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {briefing?.articles && briefing.articles.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Industry Intelligence</CardTitle>
              <CardDescription>Relevant news and analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {briefing.articles.slice(0, 3).map((article, index) => (
                  <div key={article.id} className="p-4 rounded-lg bg-muted/50 space-y-2" data-testid={`card-article-${index}`}>
                    <Badge variant="secondary" className="text-xs">
                      {article.category.toUpperCase()}
                    </Badge>
                    <h4 className="font-medium text-sm text-foreground">{article.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">{article.content}</p>
                    <p className="text-xs text-muted-foreground">Source: {article.source}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center pb-6">
          <Link href="/decisions">
            <Button size="lg" data-testid="button-proceed-to-decisions">
              Proceed to Decisions
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </ScrollArea>
  );
}

function BriefingSkeleton() {
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Skeleton className="h-5 w-24 mb-2" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
