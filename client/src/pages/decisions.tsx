import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import {
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  DollarSign,
  Users,
  Factory,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Team, WeeklyDecision, DecisionOption } from "@shared/schema";

function ImpactBadge({ value, label, positive }: { value: string | number; label: string; positive?: boolean }) {
  const isPositive = positive ?? (typeof value === 'number' ? value > 0 : value.startsWith('+'));
  const colorClass = isPositive ? "text-green-400" : "text-red-400";
  
  return (
    <div className="flex items-center gap-1 text-xs">
      {isPositive ? <TrendingUp className="w-3 h-3 text-green-400" /> : <TrendingDown className="w-3 h-3 text-red-400" />}
      <span className={colorClass}>{typeof value === 'number' && value > 0 ? '+' : ''}{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

function DecisionCard({ 
  decision, 
  selectedOption, 
  onSelectOption,
  onSubmit,
  isSubmitting,
  rationale,
  onRationaleChange,
}: { 
  decision: WeeklyDecision;
  selectedOption: string | null;
  onSelectOption: (optionId: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  rationale: string;
  onRationaleChange: (value: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  const categoryColors: Record<string, string> = {
    automation_financing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    workforce_displacement: "bg-red-500/20 text-red-400 border-red-500/30",
    union_relations: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    reskilling: "bg-green-500/20 text-green-400 border-green-500/30",
    management_pipeline: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    organizational_change: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    strategic_investment: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  };

  return (
    <Card className="overflow-hidden" data-testid={`card-decision-${decision.id}`}>
      <CardHeader 
        className="cursor-pointer pb-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={categoryColors[decision.category] || ""}>
              {decision.category.replace(/_/g, ' ').toUpperCase()}
            </Badge>
            {decision.deadline && (
              <Badge variant="secondary" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {decision.deadline}
              </Badge>
            )}
          </div>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
        <CardTitle className="text-lg mt-2">{decision.title}</CardTitle>
        <CardDescription>{decision.context}</CardDescription>
      </CardHeader>
      
      {expanded && (
        <CardContent className="space-y-6">
          {decision.stakeholderPerspectives.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                Stakeholder Perspectives
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {decision.stakeholderPerspectives.map((perspective, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/50 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{perspective.role}</span>
                      <Badge variant="outline" className="text-xs">{perspective.stance}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground italic">"{perspective.quote}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Choose Your Approach</h4>
            <div className="grid grid-cols-1 gap-4">
              {decision.options.map((option) => (
                <OptionCard
                  key={option.id}
                  option={option}
                  isSelected={selectedOption === option.id}
                  onSelect={() => onSelectOption(option.id)}
                />
              ))}
            </div>
          </div>

          {selectedOption && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <label className="text-sm font-medium">Decision Rationale (Optional)</label>
                <Textarea
                  placeholder="Document your reasoning for this decision..."
                  value={rationale}
                  onChange={(e) => onRationaleChange(e.target.value)}
                  className="resize-none"
                  rows={2}
                  data-testid="input-rationale"
                />
              </div>
              <Button 
                className="w-full" 
                onClick={onSubmit}
                disabled={isSubmitting}
                data-testid="button-submit-decision"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Confirm Decision
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

function OptionCard({ option, isSelected, onSelect }: { option: DecisionOption; isSelected: boolean; onSelect: () => void }) {
  return (
    <div
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected 
          ? "border-primary bg-primary/5" 
          : "border-border hover:border-primary/50"
      }`}
      onClick={onSelect}
      data-testid={`option-${option.id}`}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h5 className="font-medium text-foreground">{option.label}</h5>
          <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
          isSelected ? "border-primary bg-primary" : "border-muted-foreground"
        }`}>
          {isSelected && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        {option.financialImpact.debt !== undefined && option.financialImpact.debt !== 0 && (
          <div className="flex items-center gap-2 text-xs p-2 rounded bg-muted/50">
            <DollarSign className="w-3 h-3 text-red-400" />
            <span className="text-muted-foreground">Debt:</span>
            <span className="font-mono text-red-400">+${(option.financialImpact.debt / 1000000).toFixed(1)}M</span>
          </div>
        )}
        {option.financialImpact.cost !== undefined && option.financialImpact.cost !== 0 && (
          <div className="flex items-center gap-2 text-xs p-2 rounded bg-muted/50">
            <DollarSign className="w-3 h-3 text-orange-400" />
            <span className="text-muted-foreground">Cost:</span>
            <span className="font-mono text-orange-400">${(option.financialImpact.cost / 1000000).toFixed(2)}M</span>
          </div>
        )}
        {option.workforceImpact.morale !== undefined && option.workforceImpact.morale !== 0 && (
          <div className="flex items-center gap-2 text-xs p-2 rounded bg-muted/50">
            <Users className="w-3 h-3" />
            <span className="text-muted-foreground">Morale:</span>
            <span className={`font-mono ${option.workforceImpact.morale > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {option.workforceImpact.morale > 0 ? '+' : ''}{option.workforceImpact.morale}
            </span>
          </div>
        )}
        {option.workforceImpact.unionSentiment !== undefined && option.workforceImpact.unionSentiment !== 0 && (
          <div className="flex items-center gap-2 text-xs p-2 rounded bg-muted/50">
            <AlertTriangle className="w-3 h-3 text-orange-400" />
            <span className="text-muted-foreground">Union:</span>
            <span className={`font-mono ${option.workforceImpact.unionSentiment < 0 ? 'text-green-400' : 'text-red-400'}`}>
              {option.workforceImpact.unionSentiment > 0 ? '+' : ''}{option.workforceImpact.unionSentiment}
            </span>
          </div>
        )}
        {option.workforceImpact.employees !== undefined && option.workforceImpact.employees !== 0 && (
          <div className="flex items-center gap-2 text-xs p-2 rounded bg-muted/50">
            <Users className="w-3 h-3" />
            <span className="text-muted-foreground">Jobs:</span>
            <span className={`font-mono ${option.workforceImpact.employees > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {option.workforceImpact.employees > 0 ? '+' : ''}{option.workforceImpact.employees}
            </span>
          </div>
        )}
        {option.automationImpact?.level !== undefined && option.automationImpact.level !== 0 && (
          <div className="flex items-center gap-2 text-xs p-2 rounded bg-muted/50">
            <Factory className="w-3 h-3 text-blue-400" />
            <span className="text-muted-foreground">Automation:</span>
            <span className="font-mono text-blue-400">+{option.automationImpact.level}%</span>
          </div>
        )}
      </div>

      {option.risks.length > 0 && (
        <div className="space-y-1">
          <span className="text-xs font-medium text-orange-400">Risks:</span>
          <ul className="text-xs text-muted-foreground space-y-0.5">
            {option.risks.slice(0, 2).map((risk, i) => (
              <li key={i} className="flex items-start gap-1">
                <AlertTriangle className="w-3 h-3 text-orange-400 shrink-0 mt-0.5" />
                {risk}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-2 text-xs text-muted-foreground">
        <Clock className="w-3 h-3 inline mr-1" />
        {option.timeframe}
      </div>
    </div>
  );
}

export default function Decisions() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [rationales, setRationales] = useState<Record<string, string>>({});
  const [submittedDecisions, setSubmittedDecisions] = useState<Set<string>>(new Set());

  const { data: team, isLoading: teamLoading } = useQuery<Team>({
    queryKey: ["/api/team"],
  });

  const { data: decisions, isLoading: decisionsLoading } = useQuery<WeeklyDecision[]>({
    queryKey: ["/api/decisions", team?.currentWeek],
    enabled: !!team?.currentWeek,
  });

  const submitDecisionMutation = useMutation({
    mutationFn: async ({ decisionId, optionId, rationale }: { decisionId: string; optionId: string; rationale?: string }) => {
      return apiRequest("POST", "/api/submit-decision", { decisionId, optionId, rationale });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      setSubmittedDecisions(prev => new Set([...prev, variables.decisionId]));
      toast({
        title: "Decision Submitted",
        description: "Your choice has been recorded.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit decision.",
        variant: "destructive",
      });
    },
  });

  const advanceWeekMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/advance-week", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      queryClient.invalidateQueries({ queryKey: ["/api/briefing"] });
      toast({
        title: "Week Complete",
        description: "Advancing to the next week...",
      });
      navigate("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to advance to the next week.",
        variant: "destructive",
      });
    },
  });

  if (teamLoading || decisionsLoading) {
    return <DecisionsSkeleton />;
  }

  if (!team || !decisions) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Unable to load decisions</h2>
        <p className="text-muted-foreground text-center max-w-md">
          There was an error loading the decision interface.
        </p>
      </div>
    );
  }

  const pendingDecisions = decisions.filter(d => !submittedDecisions.has(d.id));
  const allDecisionsMade = pendingDecisions.length === 0 && decisions.length > 0;

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6 max-w-4xl mx-auto" data-testid="decisions-page">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="font-mono">
                Week {team.currentWeek}
              </Badge>
              <Badge variant={allDecisionsMade ? "default" : "secondary"}>
                {submittedDecisions.size} / {decisions.length} Decisions Made
              </Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Strategic Decisions</h1>
            <p className="text-muted-foreground">
              Make critical choices that will shape Apex's future
            </p>
          </div>
          {allDecisionsMade && (
            <Button
              onClick={() => advanceWeekMutation.mutate()}
              disabled={advanceWeekMutation.isPending}
              data-testid="button-complete-week"
            >
              {advanceWeekMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Complete Week {team.currentWeek}
                </>
              )}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card/50">
            <CardContent className="p-4 flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">Cash</div>
                <div className="font-mono font-bold">${(team.companyState.cash / 1000000).toFixed(1)}M</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="p-4 flex items-center gap-3">
              <Factory className="w-5 h-5 text-blue-400" />
              <div>
                <div className="text-xs text-muted-foreground">Automation</div>
                <div className="font-mono font-bold">{team.companyState.automationLevel}%</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="w-5 h-5 text-green-400" />
              <div>
                <div className="text-xs text-muted-foreground">Morale</div>
                <div className="font-mono font-bold">{team.companyState.morale}%</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <div>
                <div className="text-xs text-muted-foreground">Union Risk</div>
                <div className="font-mono font-bold">{team.companyState.unionSentiment}%</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {decisions.map((decision) => {
            const isSubmitted = submittedDecisions.has(decision.id);
            
            if (isSubmitted) {
              return (
                <Card key={decision.id} className="opacity-60 bg-muted/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        {decision.title}
                      </CardTitle>
                      <Badge variant="outline" className="text-green-400 border-green-400/30">
                        Decision Submitted
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              );
            }

            return (
              <DecisionCard
                key={decision.id}
                decision={decision}
                selectedOption={selectedOptions[decision.id] || null}
                onSelectOption={(optionId) => setSelectedOptions(prev => ({ ...prev, [decision.id]: optionId }))}
                onSubmit={() => {
                  const optionId = selectedOptions[decision.id];
                  if (optionId) {
                    submitDecisionMutation.mutate({
                      decisionId: decision.id,
                      optionId,
                      rationale: rationales[decision.id],
                    });
                  }
                }}
                isSubmitting={submitDecisionMutation.isPending}
                rationale={rationales[decision.id] || ""}
                onRationaleChange={(value) => setRationales(prev => ({ ...prev, [decision.id]: value }))}
              />
            );
          })}
        </div>

        {allDecisionsMade && (
          <div className="flex justify-center pb-6">
            <Button
              size="lg"
              onClick={() => advanceWeekMutation.mutate()}
              disabled={advanceWeekMutation.isPending}
              data-testid="button-complete-week-bottom"
            >
              {advanceWeekMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Complete Week {team.currentWeek} and See Results
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

function DecisionsSkeleton() {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <div className="space-y-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-64 mb-4" />
              <Skeleton className="h-20 w-full mb-4" />
              <div className="grid grid-cols-1 gap-4">
                {[...Array(3)].map((_, j) => (
                  <Skeleton key={j} className="h-32" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
