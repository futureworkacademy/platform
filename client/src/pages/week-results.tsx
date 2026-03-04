import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLocation } from "wouter";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  CheckCircle2,
  Brain,
  Target,
  MessageSquare,
  ThumbsUp,
  Lightbulb,
  User,
  Award,
  ChevronDown,
  ChevronUp,
  BarChart3,
  FileText,
  Sparkles,
  BookOpen,
  Scale,
  Users,
  Layers,
  Info,
  ImageIcon,
} from "lucide-react";
import { useState } from "react";
import type { PlayerDecisionSubmission } from "@shared/schema";
import { defaultRubricCriteria } from "@shared/schema";

interface RubricCriterionWithWeight {
  id: string;
  name: string;
  description: string;
  maxPoints: number;
  evaluationGuidelines: string;
  weight?: number;
}

interface TeamData {
  id: string;
  name: string;
  currentWeek: number;
  totalWeeks: number;
  financialScore?: number;
  culturalScore?: number;
}

interface WeekResultsData {
  weekNumber: number;
  financialScore: number;
  culturalScore: number;
  combinedScore: number;
  previousRank: number;
  currentRank: number;
  rankChange: number;
  decisions: Array<{
    id: string;
    title: string;
    category: string;
    submittedAt: string;
    attributeValues: Record<string, any>;
    llmEvaluations?: Array<{
      attributeId: string;
      rubricScores: Array<{
        criterionId: string;
        criterionName: string;
        score: number;
        maxScore: number;
        feedback: string;
      }>;
      totalScore: number;
      maxPossibleScore: number;
      percentageScore: number;
      overallFeedback: string;
      strengths: string[];
      areasForImprovement: string[];
    }>;
    overallLLMScore?: number;
    attachmentUrls?: string[];
  }>;
  topAnswers?: Array<{
    decisionId: string;
    decisionTitle: string;
    attributeId: string;
    attributeLabel: string;
    anonymizedResponse: string;
    score: number;
    strengths: string[];
  }>;
}

function RubricScoreDisplay({ 
  rubricScores, 
  criteria 
}: { 
  rubricScores: Array<{
    criterionId: string;
    criterionName: string;
    score: number;
    maxScore: number;
    feedback: string;
  }>;
  criteria: RubricCriterionWithWeight[];
}) {
  const [expandedCriteria, setExpandedCriteria] = useState<string | null>(null);

  const getCriterionIcon = (criterionId: string) => {
    switch (criterionId) {
      case "evidence_quality": return <BookOpen className="w-4 h-4" />;
      case "reasoning_coherence": return <Brain className="w-4 h-4" />;
      case "tradeoff_analysis": return <Scale className="w-4 h-4" />;
      case "stakeholder_consideration": return <Users className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 93) return "text-success";
    if (percentage >= 72) return "text-warning";
    return "text-muted-foreground";
  };

  return (
    <div className="space-y-3">
      {rubricScores.map((rs) => {
        const criterion = criteria.find(c => c.id === rs.criterionId);
        const percentage = (rs.score / rs.maxScore) * 100;
        const isExpanded = expandedCriteria === rs.criterionId;
        
        return (
          <div key={rs.criterionId} className="border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setExpandedCriteria(isExpanded ? null : rs.criterionId)}
              className="w-full flex items-center justify-between p-3 hover-elevate text-left"
            >
              <div className="flex items-center gap-3">
                <div className="text-muted-foreground">
                  {getCriterionIcon(rs.criterionId)}
                </div>
                <div>
                  <span className="font-medium text-sm">{rs.criterionName}</span>
                  {criterion?.weight && (
                    <span className="text-xs text-muted-foreground ml-2">
                      ({criterion.weight}% weight)
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-mono font-semibold ${getScoreColor(rs.score, rs.maxScore)}`}>
                  {rs.score}/{rs.maxScore}
                </span>
                <Progress value={percentage} className="w-16 h-2" />
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>
            
            {isExpanded && (
              <div className="px-3 pb-3 border-t bg-muted/30">
                <p className="text-sm text-muted-foreground pt-3 leading-relaxed">
                  {rs.feedback}
                </p>
                {criterion?.description && (
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    Criterion: {criterion.description}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DecisionResultCard({ 
  decision,
}: { 
  decision: WeekResultsData["decisions"][0];
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const hasLLMEvaluations = decision.llmEvaluations && decision.llmEvaluations.length > 0;
  const overallScore = decision.overallLLMScore || 0;
  
  const getScoreBadgeVariant = (score: number) => {
    if (score >= 93) return "default";
    if (score >= 72) return "secondary";
    return "outline";
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "technology_operations": return <Layers className="w-4 h-4" />;
      case "management_pipeline": return <Users className="w-4 h-4" />;
      case "union_relations": return <Scale className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <Card className={isExpanded ? "ring-1 ring-primary/30" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-md bg-muted">
              {getCategoryIcon(decision.category)}
            </div>
            <div>
              <CardTitle className="text-base">{decision.title}</CardTitle>
              <CardDescription className="text-xs mt-1">
                Submitted {new Date(decision.submittedAt).toLocaleDateString()}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasLLMEvaluations && (
              <Badge variant={getScoreBadgeVariant(overallScore)}>
                <Brain className="w-3 h-3 mr-1" />
                {overallScore}%
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              data-testid={`button-expand-decision-${decision.id}`}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <Separator className="mb-4" />
          
          {decision.attachmentUrls && decision.attachmentUrls.length > 0 && (
            <div className="mb-4" data-testid="submission-attachments">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                Attached Visualizations ({decision.attachmentUrls.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {decision.attachmentUrls.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border bg-muted/30 overflow-hidden aspect-[4/3] block hover:ring-2 hover:ring-primary/40 transition-all"
                    data-testid={`attachment-image-${i}`}
                  >
                    <img
                      src={url}
                      alt={`Visualization ${i + 1}`}
                      className="w-full h-full object-contain p-1"
                      loading="lazy"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {hasLLMEvaluations ? (
            <div className="space-y-6">
              {decision.llmEvaluations!.map((evaluation, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm">Essay Evaluation</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Score: </span>
                      <span className="font-mono font-semibold">
                        {evaluation.totalScore}/{evaluation.maxPossibleScore}
                      </span>
                      <span className="text-muted-foreground ml-1">
                        ({evaluation.percentageScore}%)
                      </span>
                    </div>
                  </div>
                  
                  <Progress 
                    value={evaluation.percentageScore} 
                    className="h-3" 
                  />

                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground" data-testid="text-instructor-review-notice">
                    <Info className="h-3 w-3 shrink-0" />
                    This score <em>may</em> change pending instructor review.
                  </p>
                  
                  <Alert>
                    <MessageSquare className="h-4 w-4" />
                    <AlertTitle>AI Feedback</AlertTitle>
                    <AlertDescription className="text-sm leading-relaxed">
                      {evaluation.overallFeedback}
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {evaluation.strengths.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-success">
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-sm font-medium">Strengths</span>
                        </div>
                        <ul className="space-y-1">
                          {evaluation.strengths.map((s, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <CheckCircle2 className="w-3 h-3 mt-1 shrink-0 text-success" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {evaluation.areasForImprovement.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-warning">
                          <Lightbulb className="w-4 h-4" />
                          <span className="text-sm font-medium">Areas for Improvement</span>
                        </div>
                        <ul className="space-y-1">
                          {evaluation.areasForImprovement.map((a, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <ArrowRight className="w-3 h-3 mt-1 shrink-0 text-warning" />
                              <span>{a}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-2">
                    <h4 className="text-sm font-medium mb-3">Detailed Rubric Scores</h4>
                    <RubricScoreDisplay 
                      rubricScores={evaluation.rubricScores} 
                      criteria={defaultRubricCriteria} 
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No essay evaluation for this decision</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

function TopAnswersSection({ topAnswers }: { topAnswers: WeekResultsData["topAnswers"] }) {
  if (!topAnswers || topAnswers.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-warning" />
          <CardTitle className="text-lg">Exemplary Responses</CardTitle>
        </div>
        <CardDescription>
          Top-scoring anonymized responses from your cohort
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {topAnswers.map((answer, idx) => (
          <div key={idx} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Badge variant="outline" className="mb-2">{answer.decisionTitle}</Badge>
                <p className="text-sm font-medium">{answer.attributeLabel}</p>
              </div>
              <Badge variant="default">
                <Trophy className="w-3 h-3 mr-1" />
                {answer.score}%
              </Badge>
            </div>
            
            <blockquote className="pl-4 border-l-2 border-primary/30 text-sm text-muted-foreground italic">
              "{answer.anonymizedResponse}"
            </blockquote>
            
            {answer.strengths.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {answer.strengths.slice(0, 3).map((s, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {s}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RankChangeIndicator({ change }: { change: number }) {
  if (change > 0) {
    return (
      <div className="flex items-center gap-1 text-success">
        <TrendingUp className="w-4 h-4" />
        <span className="font-semibold">+{change}</span>
      </div>
    );
  } else if (change < 0) {
    return (
      <div className="flex items-center gap-1 text-destructive">
        <TrendingDown className="w-4 h-4" />
        <span className="font-semibold">{change}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 text-muted-foreground">
      <Minus className="w-4 h-4" />
      <span className="font-semibold">0</span>
    </div>
  );
}

export default function WeekResults() {
  const [, setLocation] = useLocation();

  const { data: team } = useQuery<TeamData>({
    queryKey: ["/api/team"],
  });

  const { data: resultsData, isLoading } = useQuery<WeekResultsData>({
    queryKey: ["/api/week-results", team?.currentWeek ? team.currentWeek - 1 : 0],
    enabled: !!team && team.currentWeek > 1,
  });

  if (isLoading) {
    return <WeekResultsSkeleton />;
  }

  if (!team || team.currentWeek <= 1) {
    return (
      <ScrollArea className="h-full">
        <div className="p-6 max-w-4xl mx-auto">
          <Card className="text-center py-12">
            <CardContent>
              <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h2 className="text-lg font-semibold mb-2">No Results Yet</h2>
              <p className="text-muted-foreground mb-4">
                Complete your first week to see your results and performance analysis.
              </p>
              <Button onClick={() => setLocation("/decisions")} data-testid="button-go-to-decisions">
                Go to Decisions
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    );
  }

  const mockResultsData: WeekResultsData = resultsData || {
    weekNumber: team.currentWeek - 1,
    financialScore: team.financialScore || 0,
    culturalScore: team.culturalScore || 0,
    combinedScore: Math.round(((team.financialScore || 0) + (team.culturalScore || 0)) / 2),
    previousRank: 3,
    currentRank: 2,
    rankChange: 1,
    decisions: [],
    topAnswers: [],
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge variant="outline" className="mb-2">Week {mockResultsData.weekNumber} Complete</Badge>
            <h1 className="text-2xl font-bold">Weekly Results</h1>
            <p className="text-muted-foreground">
              Review your performance and AI-evaluated essay scores
            </p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-center p-4 rounded-lg bg-muted">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Trophy className="w-5 h-5 text-warning" />
                  <span className="text-2xl font-bold">#{mockResultsData.currentRank}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs text-muted-foreground">Rank Change:</span>
                  <RankChangeIndicator change={mockResultsData.rankChange} />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>Your current position on the leaderboard</TooltipContent>
          </Tooltip>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Financial Score</span>
                <Badge variant="outline">{mockResultsData.financialScore}%</Badge>
              </div>
              <Progress value={mockResultsData.financialScore} className="h-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Cultural Score</span>
                <Badge variant="outline">{mockResultsData.culturalScore}%</Badge>
              </div>
              <Progress value={mockResultsData.culturalScore} className="h-2" />
            </CardContent>
          </Card>
          
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Combined Score</span>
                <Badge>{mockResultsData.combinedScore}%</Badge>
              </div>
              <Progress value={mockResultsData.combinedScore} className="h-3" />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Decision Evaluations
          </h2>
          
          {mockResultsData.decisions.length > 0 ? (
            mockResultsData.decisions.map((decision) => (
              <DecisionResultCard key={decision.id} decision={decision} />
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No evaluated decisions for this week</p>
              </CardContent>
            </Card>
          )}
        </div>

        <TopAnswersSection topAnswers={mockResultsData.topAnswers} />

        <Card className="bg-muted/30">
          <CardContent className="py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <div>
                  <p className="font-medium">Ready for Week {team.currentWeek}</p>
                  <p className="text-sm text-muted-foreground">
                    Continue to make strategic decisions for your company
                  </p>
                </div>
              </div>
              <Button onClick={() => setLocation("/decisions")} data-testid="button-continue-simulation">
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}

function WeekResultsSkeleton() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-20 w-24 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-6 w-48" />
      {[...Array(2)].map((_, i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
  );
}
