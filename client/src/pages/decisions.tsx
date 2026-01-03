import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  DollarSign,
  Users,
  Factory,
  AlertTriangle,
  Clock,
  MessageSquare,
  Sliders,
  Sparkles,
} from "lucide-react";
import type { Team, WeeklyDecision, DecisionOption, EnhancedDecision, DecisionAttribute } from "@shared/schema";

const MINIMUM_WORDS = 100;

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
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
            <DollarSign className="w-3 h-3 text-destructive" />
            <span className="text-muted-foreground">Debt:</span>
            <span className="font-mono text-destructive">+${(option.financialImpact.debt / 1000000).toFixed(1)}M</span>
          </div>
        )}
        {option.financialImpact.cost !== undefined && option.financialImpact.cost !== 0 && (
          <div className="flex items-center gap-2 text-xs p-2 rounded bg-muted/50">
            <DollarSign className="w-3 h-3 text-warning" />
            <span className="text-muted-foreground">Cost:</span>
            <span className="font-mono text-warning">${(option.financialImpact.cost / 1000000).toFixed(2)}M</span>
          </div>
        )}
        {option.workforceImpact.morale !== undefined && option.workforceImpact.morale !== 0 && (
          <div className="flex items-center gap-2 text-xs p-2 rounded bg-muted/50">
            <Users className="w-3 h-3" />
            <span className="text-muted-foreground">Morale:</span>
            <span className={`font-mono ${option.workforceImpact.morale > 0 ? 'text-success' : 'text-destructive'}`}>
              {option.workforceImpact.morale > 0 ? '+' : ''}{option.workforceImpact.morale}
            </span>
          </div>
        )}
        {option.workforceImpact.unionSentiment !== undefined && option.workforceImpact.unionSentiment !== 0 && (
          <div className="flex items-center gap-2 text-xs p-2 rounded bg-muted/50">
            <AlertTriangle className="w-3 h-3 text-warning" />
            <span className="text-muted-foreground">Union:</span>
            <span className={`font-mono ${option.workforceImpact.unionSentiment < 0 ? 'text-success' : 'text-destructive'}`}>
              {option.workforceImpact.unionSentiment > 0 ? '+' : ''}{option.workforceImpact.unionSentiment}
            </span>
          </div>
        )}
        {option.workforceImpact.employees !== undefined && option.workforceImpact.employees !== 0 && (
          <div className="flex items-center gap-2 text-xs p-2 rounded bg-muted/50">
            <Users className="w-3 h-3" />
            <span className="text-muted-foreground">Jobs:</span>
            <span className={`font-mono ${option.workforceImpact.employees > 0 ? 'text-success' : 'text-destructive'}`}>
              {option.workforceImpact.employees > 0 ? '+' : ''}{option.workforceImpact.employees}
            </span>
          </div>
        )}
        {option.automationImpact?.level !== undefined && option.automationImpact.level !== 0 && (
          <div className="flex items-center gap-2 text-xs p-2 rounded bg-muted/50">
            <Factory className="w-3 h-3 text-accent" />
            <span className="text-muted-foreground">Automation:</span>
            <span className="font-mono text-accent">+{option.automationImpact.level}%</span>
          </div>
        )}
      </div>

      {option.risks.length > 0 && (
        <div className="space-y-1">
          <span className="text-xs font-medium text-warning">Risks:</span>
          <ul className="text-xs text-muted-foreground space-y-0.5">
            {option.risks.slice(0, 2).map((risk, i) => (
              <li key={i} className="flex items-start gap-1">
                <AlertTriangle className="w-3 h-3 text-warning shrink-0 mt-0.5" />
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

function AttributeInput({ 
  attribute, 
  value, 
  onChange 
}: { 
  attribute: DecisionAttribute; 
  value: number | string | boolean; 
  onChange: (value: number | string | boolean) => void;
}) {
  if (attribute.type === "slider") {
    const numValue = typeof value === 'number' ? value : (attribute.defaultValue ?? attribute.min ?? 0);
    const isPercentage = attribute.label.toLowerCase().includes('%') || attribute.label.toLowerCase().includes('percentage');
    const isBudget = attribute.label.toLowerCase().includes('budget');
    
    return (
      <div className="space-y-3 p-4 rounded-lg bg-muted/30 border">
        <div className="flex items-start justify-between gap-4">
          <div>
            <label className="text-sm font-medium">{attribute.label}</label>
            <p className="text-xs text-muted-foreground mt-1">{attribute.description}</p>
          </div>
          <div className="text-right shrink-0">
            <span className="font-mono text-lg font-bold text-primary">
              {isBudget ? formatCurrency(numValue) : `${numValue}${isPercentage ? '' : '%'}`}
            </span>
          </div>
        </div>
        <Slider
          value={[numValue]}
          min={attribute.min ?? 0}
          max={attribute.max ?? 100}
          step={attribute.step ?? 1}
          onValueChange={(vals) => onChange(vals[0])}
          data-testid={`slider-${attribute.id}`}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{isBudget ? formatCurrency(attribute.min ?? 0) : `${attribute.min ?? 0}${isPercentage ? '' : '%'}`}</span>
          <span>{isBudget ? formatCurrency(attribute.max ?? 100) : `${attribute.max ?? 100}${isPercentage ? '' : '%'}`}</span>
        </div>
      </div>
    );
  }

  if (attribute.type === "budget") {
    const numValue = typeof value === 'number' ? value : (attribute.defaultValue ?? 0);
    
    return (
      <div className="space-y-3 p-4 rounded-lg bg-muted/30 border">
        <div className="flex items-start justify-between gap-4">
          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              {attribute.label}
            </label>
            <p className="text-xs text-muted-foreground mt-1">{attribute.description}</p>
          </div>
          <div className="text-right shrink-0">
            <span className="font-mono text-lg font-bold text-primary">
              {formatCurrency(numValue)}
            </span>
          </div>
        </div>
        <Slider
          value={[numValue]}
          min={attribute.min ?? 0}
          max={attribute.max ?? 10000000}
          step={attribute.step ?? 100000}
          onValueChange={(vals) => onChange(vals[0])}
          data-testid={`budget-${attribute.id}`}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatCurrency(attribute.min ?? 0)}</span>
          <span>{formatCurrency(attribute.max ?? 10000000)}</span>
        </div>
      </div>
    );
  }

  if (attribute.type === "toggle") {
    const boolValue = typeof value === 'boolean' ? value : false;
    
    return (
      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border">
        <div className="flex-1">
          <label className="text-sm font-medium">{attribute.label}</label>
          <p className="text-xs text-muted-foreground mt-1">{attribute.description}</p>
        </div>
        <Switch
          checked={boolValue}
          onCheckedChange={(checked) => onChange(checked)}
          data-testid={`toggle-${attribute.id}`}
        />
      </div>
    );
  }

  if (attribute.type === "select" && attribute.options) {
    const strValue = typeof value === 'string' ? value : "";
    
    return (
      <div className="space-y-3 p-4 rounded-lg bg-muted/30 border">
        <div>
          <label className="text-sm font-medium">{attribute.label}</label>
          <p className="text-xs text-muted-foreground mt-1">{attribute.description}</p>
        </div>
        <Select value={strValue} onValueChange={(val) => onChange(val)}>
          <SelectTrigger data-testid={`select-${attribute.id}`}>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {attribute.options.map((opt) => (
              <SelectItem key={opt.id} value={opt.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{opt.label}</span>
                  {opt.description && (
                    <span className="text-xs text-muted-foreground">{opt.description}</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return null;
}

function EnhancedDecisionCard({
  decision,
  attributeValues,
  onAttributeChange,
  rationale,
  onRationaleChange,
  isSubmitted,
  onSubmit,
  isSubmitting,
}: {
  decision: EnhancedDecision;
  attributeValues: Record<string, number | string | boolean>;
  onAttributeChange: (attrId: string, value: number | string | boolean) => void;
  rationale: string;
  onRationaleChange: (value: string) => void;
  isSubmitted: boolean;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  const wordCount = countWords(rationale);
  const isRationaleValid = wordCount >= MINIMUM_WORDS;

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
    <Card data-testid={`card-enhanced-decision-${decision.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={categoryColors[decision.category] || ""}>
            {decision.category.replace(/_/g, ' ').toUpperCase()}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <Sliders className="w-3 h-3 mr-1" />
            Multi-Attribute Decision
          </Badge>
          {isSubmitted && (
            <Badge variant="outline" className="text-success border-success/30">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Submitted
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg mt-2">{decision.title}</CardTitle>
        <CardDescription>{decision.context}</CardDescription>
      </CardHeader>
      
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
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Sliders className="w-4 h-4 text-muted-foreground" />
            Configure Your Strategy
          </h4>
          <div className="space-y-4">
            {decision.attributes.map((attr) => (
              <AttributeInput
                key={attr.id}
                attribute={attr}
                value={attributeValues[attr.id] ?? attr.defaultValue ?? (attr.type === 'toggle' ? false : attr.type === 'select' ? '' : attr.min ?? 0)}
                onChange={(val) => onAttributeChange(attr.id, val)}
              />
            ))}
          </div>
        </div>

        {!isSubmitted && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Decision Rationale <span className="text-destructive">*</span>
                </label>
                <span className={`text-xs ${isRationaleValid ? 'text-success' : 'text-muted-foreground'}`}>
                  {wordCount} / {MINIMUM_WORDS} words minimum
                </span>
              </div>
              <Textarea
                placeholder={`Explain your reasoning for these choices in at least ${MINIMUM_WORDS} words. Reference specific data from your research to demonstrate thorough analysis...`}
                value={rationale}
                onChange={(e) => onRationaleChange(e.target.value)}
                className={`resize-none ${!isRationaleValid && wordCount > 0 ? 'border-warning' : ''}`}
                rows={5}
                data-testid="input-enhanced-rationale"
              />
              {wordCount > 0 && !isRationaleValid && (
                <p className="text-xs text-warning flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {MINIMUM_WORDS - wordCount} more words needed
                </p>
              )}
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Tip: Reference specific statistics and case studies from your research materials for bonus points!
              </p>
            </div>
          </div>
        )}

        {!isSubmitted && (
          <div className="flex justify-end pt-4 border-t">
            <Button 
              onClick={onSubmit}
              disabled={!isRationaleValid || isSubmitting}
              data-testid="button-submit-enhanced-decision"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Submit Strategy
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Decisions() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [rationales, setRationales] = useState<Record<string, string>>({});
  const [submittedDecisions, setSubmittedDecisions] = useState<Set<string>>(new Set());
  const [enhancedAttributeValues, setEnhancedAttributeValues] = useState<Record<string, Record<string, number | string | boolean>>>({});
  const [enhancedRationales, setEnhancedRationales] = useState<Record<string, string>>({});
  const [submittedEnhanced, setSubmittedEnhanced] = useState<Set<string>>(new Set());

  const { data: team, isLoading: teamLoading } = useQuery<Team>({
    queryKey: ["/api/team"],
  });

  const { data: decisions, isLoading: decisionsLoading } = useQuery<WeeklyDecision[]>({
    queryKey: ["/api/decisions", team?.currentWeek],
    enabled: !!team?.currentWeek,
  });

  const { data: enhancedDecisions, isLoading: enhancedLoading } = useQuery<EnhancedDecision[]>({
    queryKey: ["/api/enhanced-decisions", team?.currentWeek],
    enabled: !!team?.currentWeek,
  });

  useEffect(() => {
    if (enhancedDecisions && enhancedDecisions.length > 0) {
      setEnhancedAttributeValues(prev => {
        const updated = { ...prev };
        for (const decision of enhancedDecisions) {
          if (!updated[decision.id]) {
            updated[decision.id] = {};
          }
          for (const attr of decision.attributes) {
            if (updated[decision.id][attr.id] === undefined) {
              if (attr.defaultValue !== undefined) {
                updated[decision.id][attr.id] = attr.defaultValue;
              } else if (attr.type === 'toggle') {
                updated[decision.id][attr.id] = false;
              } else if (attr.type === 'select') {
                updated[decision.id][attr.id] = attr.options?.[0]?.id || '';
              } else {
                updated[decision.id][attr.id] = attr.min ?? 0;
              }
            }
          }
        }
        return updated;
      });
    }
  }, [enhancedDecisions]);

  const submitDecisionMutation = useMutation({
    mutationFn: async ({ decisionId, optionId, rationale }: { decisionId: string; optionId: string; rationale: string }) => {
      return apiRequest("POST", "/api/submit-decision", { decisionId, optionId, rationale });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      setSubmittedDecisions(prev => new Set(Array.from(prev).concat(variables.decisionId)));
      toast({
        title: "Decision Submitted",
        description: "Your choice has been recorded.",
      });
      
      if (decisions && currentStep < decisions.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit decision.",
        variant: "destructive",
      });
    },
  });

  const submitEnhancedMutation = useMutation({
    mutationFn: async ({ decisionId, attributeValues, rationale }: { 
      decisionId: string; 
      attributeValues: Record<string, number | string | boolean>;
      rationale: string;
    }) => {
      return apiRequest("POST", "/api/submit-enhanced-decision", { decisionId, attributeValues, rationale });
    },
    onSuccess: (response: any, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      setSubmittedEnhanced(prev => new Set(Array.from(prev).concat(variables.decisionId)));
      
      if (response.easterEggsFound > 0) {
        toast({
          title: "Research Bonus!",
          description: response.message || `Great research! Detected ${response.easterEggsFound} insights from your analysis.`,
        });
      } else {
        toast({
          title: "Strategy Submitted",
          description: "Your strategic configuration has been recorded.",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit strategy.",
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

  if (teamLoading || decisionsLoading || enhancedLoading) {
    return <DecisionsSkeleton />;
  }

  if (!team) {
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

  const allDecisions = decisions || [];
  const allEnhanced = enhancedDecisions || [];
  const totalDecisions = allDecisions.length + allEnhanced.length;
  const totalSubmitted = submittedDecisions.size + submittedEnhanced.size;
  const allDecisionsMade = totalSubmitted === totalDecisions && totalDecisions > 0;
  
  const currentDecision = allDecisions[currentStep];
  const isCurrentSubmitted = currentDecision ? submittedDecisions.has(currentDecision.id) : false;
  const selectedOption = currentDecision ? selectedOptions[currentDecision.id] : null;
  const currentRationale = currentDecision ? rationales[currentDecision.id] || "" : "";
  const wordCount = countWords(currentRationale);
  const isRationaleValid = wordCount >= MINIMUM_WORDS;

  const categoryColors: Record<string, string> = {
    automation_financing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    workforce_displacement: "bg-red-500/20 text-red-400 border-red-500/30",
    union_relations: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    reskilling: "bg-green-500/20 text-green-400 border-green-500/30",
    management_pipeline: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    organizational_change: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    strategic_investment: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  };

  const handleSubmit = () => {
    if (!currentDecision || !selectedOption) return;
    
    if (!isRationaleValid) {
      toast({
        title: "Rationale Required",
        description: `Please provide at least ${MINIMUM_WORDS} words explaining your decision. Current: ${wordCount} words.`,
        variant: "destructive",
      });
      return;
    }

    submitDecisionMutation.mutate({
      decisionId: currentDecision.id,
      optionId: selectedOption,
      rationale: currentRationale,
    });
  };

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
                {totalSubmitted} / {totalDecisions} Decisions Made
              </Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Strategic Decisions</h1>
            <p className="text-muted-foreground">
              Make critical choices that will shape Apex's future
            </p>
          </div>
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
              <Factory className="w-5 h-5 text-accent" />
              <div>
                <div className="text-xs text-muted-foreground">Automation</div>
                <div className="font-mono font-bold">{team.companyState.automationLevel}%</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="w-5 h-5 text-success" />
              <div>
                <div className="text-xs text-muted-foreground">Morale</div>
                <div className="font-mono font-bold">{team.companyState.morale}%</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <div>
                <div className="text-xs text-muted-foreground">Union Risk</div>
                <div className="font-mono font-bold">{team.companyState.unionSentiment}%</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {allEnhanced.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Sliders className="w-5 h-5 text-primary" />
              Strategic Configuration Decisions
            </h2>
            {allEnhanced.map((enhanced) => (
              <EnhancedDecisionCard
                key={enhanced.id}
                decision={enhanced}
                attributeValues={enhancedAttributeValues[enhanced.id] || {}}
                onAttributeChange={(attrId, value) => {
                  setEnhancedAttributeValues(prev => ({
                    ...prev,
                    [enhanced.id]: {
                      ...(prev[enhanced.id] || {}),
                      [attrId]: value,
                    },
                  }));
                }}
                rationale={enhancedRationales[enhanced.id] || ""}
                onRationaleChange={(value) => {
                  setEnhancedRationales(prev => ({ ...prev, [enhanced.id]: value }));
                }}
                isSubmitted={submittedEnhanced.has(enhanced.id)}
                onSubmit={() => {
                  const attrs = enhancedAttributeValues[enhanced.id] || {};
                  const finalAttrs: Record<string, number | string | boolean> = {};
                  enhanced.attributes.forEach((attr) => {
                    finalAttrs[attr.id] = attrs[attr.id] ?? attr.defaultValue ?? (attr.type === 'toggle' ? false : attr.type === 'select' ? '' : attr.min ?? 0);
                  });
                  submitEnhancedMutation.mutate({
                    decisionId: enhanced.id,
                    attributeValues: finalAttrs,
                    rationale: enhancedRationales[enhanced.id] || "",
                  });
                }}
                isSubmitting={submitEnhancedMutation.isPending}
              />
            ))}
          </div>
        )}

        {allDecisions.length > 0 && (
          <>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div className="text-sm text-muted-foreground">
                    Option Decision {currentStep + 1} of {allDecisions.length}
                  </div>
                  <div className="flex items-center gap-2">
                    {allDecisions.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentStep(idx)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                          submittedDecisions.has(allDecisions[idx].id)
                            ? "bg-green-500 text-white"
                            : idx === currentStep
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                        data-testid={`step-indicator-${idx}`}
                      >
                        {submittedDecisions.has(allDecisions[idx].id) ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          idx + 1
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <Progress 
                  value={(submittedDecisions.size / allDecisions.length) * 100} 
                  className="h-2"
                />
              </CardHeader>
            </Card>

            {currentDecision && (
              <Card data-testid={`card-decision-${currentDecision.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={categoryColors[currentDecision.category] || ""}>
                      {currentDecision.category.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                    {currentDecision.deadline && (
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {currentDecision.deadline}
                      </Badge>
                    )}
                    {isCurrentSubmitted && (
                      <Badge variant="outline" className="text-success border-success/30">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Submitted
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg mt-2">{currentDecision.title}</CardTitle>
                  <CardDescription>{currentDecision.context}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {currentDecision.stakeholderPerspectives.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        Stakeholder Perspectives
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {currentDecision.stakeholderPerspectives.map((perspective, i) => (
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
                      {currentDecision.options.map((option) => (
                        <OptionCard
                          key={option.id}
                          option={option}
                          isSelected={selectedOption === option.id}
                          onSelect={() => {
                            if (!isCurrentSubmitted) {
                              setSelectedOptions(prev => ({ ...prev, [currentDecision.id]: option.id }));
                            }
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {selectedOption && !isCurrentSubmitted && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">
                            Decision Rationale <span className="text-destructive">*</span>
                          </label>
                          <span className={`text-xs ${isRationaleValid ? 'text-success' : 'text-muted-foreground'}`}>
                            {wordCount} / {MINIMUM_WORDS} words minimum
                          </span>
                        </div>
                        <Textarea
                          placeholder={`Explain your reasoning for this decision in at least ${MINIMUM_WORDS} words. Consider the financial, cultural, and strategic implications of your choice...`}
                          value={currentRationale}
                          onChange={(e) => setRationales(prev => ({ ...prev, [currentDecision.id]: e.target.value }))}
                          className={`resize-none ${!isRationaleValid && wordCount > 0 ? 'border-warning' : ''}`}
                          rows={4}
                          data-testid="input-rationale"
                        />
                        {wordCount > 0 && !isRationaleValid && (
                          <p className="text-xs text-warning flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {MINIMUM_WORDS - wordCount} more words needed
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                      disabled={currentStep === 0}
                      data-testid="button-previous-decision"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>

                    {isCurrentSubmitted ? (
                      currentStep < allDecisions.length - 1 ? (
                        <Button
                          onClick={() => setCurrentStep(currentStep + 1)}
                          data-testid="button-next-decision"
                        >
                          Next Decision
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      ) : null
                    ) : (
                      <Button 
                        onClick={handleSubmit}
                        disabled={!selectedOption || submitDecisionMutation.isPending}
                        data-testid="button-submit-decision"
                      >
                        {submitDecisionMutation.isPending ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Submit Decision
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {allDecisionsMade && (
          <Card className="border-success/30 bg-success/5">
            <CardContent className="p-6 text-center">
              <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">All Decisions Complete</h3>
              <p className="text-muted-foreground mb-4">
                You have made all strategic decisions for Week {team.currentWeek}. 
                Complete the week to see the impact of your choices.
              </p>
              <Button
                size="lg"
                onClick={() => advanceWeekMutation.mutate()}
                disabled={advanceWeekMutation.isPending}
                data-testid="button-complete-week-final"
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
            </CardContent>
          </Card>
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
      <Card>
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
    </div>
  );
}
