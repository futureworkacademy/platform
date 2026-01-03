import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { BriefingArticle } from "@/components/briefing-article";
import { EventAlert } from "@/components/event-alert";
import { Link } from "wouter";
import {
  FileText,
  Clock,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import type { WeeklyBriefing, Team } from "@shared/schema";

export default function Briefing() {
  const [readArticles, setReadArticles] = useState<Set<string>>(new Set());
  
  const { data: team } = useQuery<Team>({
    queryKey: ["/api/team"],
  });

  const { data: briefing, isLoading, error } = useQuery<WeeklyBriefing>({
    queryKey: ["/api/briefing", team?.currentWeek],
    enabled: !!team,
  });

  const handleReadArticle = (articleId: string) => {
    setReadArticles((prev) => new Set(prev).add(articleId));
  };

  if (isLoading) {
    return <BriefingSkeleton />;
  }

  if (error || !briefing || !team) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Unable to load briefing</h2>
        <p className="text-muted-foreground text-center max-w-md">
          There was an error loading this week's briefing. Please try refreshing the page.
        </p>
      </div>
    );
  }

  const readProgress = (readArticles.size / briefing.articles.length) * 100;
  const allRead = readArticles.size === briefing.articles.length;

  return (
    <div className="p-6 space-y-6" data-testid="briefing-page">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="font-mono">
              Week {briefing.weekNumber}
            </Badge>
            <span className="text-sm text-muted-foreground">{briefing.date}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Intelligence Briefing</h1>
          <p className="text-muted-foreground">
            Review this week's intelligence materials before making decisions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Est. 30 min read</span>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium">Reading Progress</div>
                <div className="text-sm text-muted-foreground">
                  {readArticles.size} of {briefing.articles.length} articles reviewed
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-48">
                <Progress value={readProgress} className="h-2" />
              </div>
              {allRead ? (
                <CheckCircle2 className="h-5 w-5 text-success" />
              ) : (
                <span className="text-sm text-muted-foreground font-mono">
                  {Math.round(readProgress)}%
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {briefing.event && (
        <EventAlert
          event={briefing.event}
          lobbyingBudget={team.companyState.lobbyingBudget}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Intelligence Articles</h2>
          </div>
          <div className="grid gap-4">
            {briefing.articles.map((article) => (
              <BriefingArticle
                key={article.id}
                article={article}
                isRead={readArticles.has(article.id)}
                onRead={() => handleReadArticle(article.id)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-warning" />
            <h2 className="text-lg font-semibold">Key Takeaways</h2>
          </div>
          <Card>
            <CardContent className="p-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Based on your reading, consider these strategic priorities:
              </p>
              <ul className="space-y-2">
                {briefing.articles
                  .flatMap((a) => a.insights)
                  .slice(0, 5)
                  .map((insight, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm"
                    >
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      <span>{insight}</span>
                    </li>
                  ))}
              </ul>
              <div className="pt-4 border-t">
                <Button className="w-full" asChild disabled={!allRead} data-testid="button-proceed-decisions">
                  <Link href="/decisions">
                    Proceed to Decisions
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                {!allRead && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Complete reading all articles first
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Company Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Revenue</span>
                <span className="font-mono font-semibold">
                  ${(team.companyState.revenue / 1000000).toFixed(2)}M
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Employees</span>
                <span className="font-mono font-semibold">
                  {team.companyState.employees}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Morale</span>
                <span className="font-mono font-semibold">
                  {team.companyState.morale}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-success transition-all"
                  style={{ width: `${team.companyState.morale}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function BriefingSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Skeleton className="h-5 w-24 mb-2" />
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
