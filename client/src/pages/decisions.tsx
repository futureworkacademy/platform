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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation, Link } from "wouter";
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
  Info,
  BookOpen,
  FileText,
  Brain,
  Home,
  Newspaper,
  Phone,
} from "lucide-react";
import { AdvisorPicker } from "@/components/advisor-picker";
import type { Team, WeeklyDecision, DecisionOption, EnhancedDecision, DecisionAttribute, ResearchReport, RubricCriterion } from "@shared/schema";
import { defaultRubricCriteria } from "@shared/schema";
import { CharacterNameLink } from "@/components/character-name-link";

// Source code reference key for helper text
const SOURCE_CODES = [
  { code: "AIM", title: "State of AI in Manufacturing 2025" },
  { code: "APX", title: "Apex Manufacturing: Company Profile" },
  { code: "WFT", title: "Workforce Transition Best Practices" },
  { code: "ATL", title: "AI Technology Landscape for Manufacturing" },
  { code: "CMP", title: "Competitive Analysis: Auto Parts Sector" },
  { code: "TFG", title: "Case Study: TechnoForge Transformation" },
];

const MINIMUM_WORDS = 100;

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

// Source code reference helper component
function SourceCodeReference() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="bg-muted/30 rounded-lg border p-3 space-y-2">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-xs font-medium text-muted-foreground w-full"
        type="button"
      >
        <BookOpen className="w-3 h-3" />
        <span>Source Code Reference Key</span>
        <span className="ml-auto text-xs">{isExpanded ? "Hide" : "Show"}</span>
      </button>
      {isExpanded && (
        <div className="grid grid-cols-2 gap-1 pt-2 border-t">
          {SOURCE_CODES.map(({ code, title }) => (
            <div key={code} className="flex items-start gap-2 text-xs">
              <Badge variant="outline" className="font-mono shrink-0">{code}</Badge>
              <span className="text-muted-foreground truncate">{title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
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
  // Tooltip content based on attribute type and ID
  const getTooltipContent = () => {
    if (attribute.id.includes('automation') || attribute.id.includes('intensity')) {
      return "Higher automation reduces labor costs but increases workforce anxiety and union risk.";
    }
    if (attribute.id.includes('reskill')) {
      return "Investment in reskilling improves morale and reduces turnover. Research shows $10,000 per employee reduces turnover by 12%.";
    }
    if (attribute.id.includes('debt') || attribute.id.includes('financing')) {
      return "Debt financing accelerates transformation but carries risk if implementation fails. Interest payments impact cash flow.";
    }
    if (attribute.id.includes('hiring')) {
      return "External hiring brings new skills but may demoralize existing workforce if internal development is neglected.";
    }
    if (attribute.id.includes('training')) {
      return "Internal training builds loyalty and institutional knowledge. Takes longer but improves retention.";
    }
    if (attribute.id.includes('dual_career') || attribute.id.includes('career')) {
      return "Dual career tracks allow technical experts to advance without becoming managers - key for Gen Z retention.";
    }
    if (attribute.id.includes('job_guarantee')) {
      return "Job guarantees for reskilled workers can achieve 80% internal redeployment and defuse union organizing.";
    }
    if (attribute.id.includes('wage')) {
      return "Wage increases directly impact labor costs but improve morale and reduce union organizing pressure.";
    }
    if (attribute.id.includes('council') || attribute.id.includes('union')) {
      return "Worker councils give employees a voice without full unionization. Can reduce adversarial dynamics.";
    }
    if (attribute.id.includes('communication') || attribute.id.includes('campaign')) {
      return "Communication reduces workforce anxiety by 35% when done early and transparently.";
    }
    return attribute.description;
  };

  if (attribute.type === "slider") {
    const numValue = typeof value === 'number' ? value : (attribute.defaultValue ?? attribute.min ?? 0);
    const isPercentage = attribute.label.toLowerCase().includes('%') || attribute.label.toLowerCase().includes('percentage');
    const isBudget = attribute.label.toLowerCase().includes('budget');
    
    return (
      <div className="space-y-3 p-4 rounded-lg bg-muted/30 border">
        <div className="flex items-start justify-between gap-4">
          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              {attribute.label}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{getTooltipContent()}</p>
                </TooltipContent>
              </Tooltip>
            </label>
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{getTooltipContent()}</p>
                </TooltipContent>
              </Tooltip>
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
          <label className="text-sm font-medium flex items-center gap-2">
            {attribute.label}
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{getTooltipContent()}</p>
              </TooltipContent>
            </Tooltip>
          </label>
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
          <label className="text-sm font-medium flex items-center gap-2">
            {attribute.label}
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{getTooltipContent()}</p>
              </TooltipContent>
            </Tooltip>
          </label>
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

  if (attribute.type === "text") {
    const strValue = typeof value === 'string' ? value : "";
    const rubricCriteria = attribute.rubricCriteria || defaultRubricCriteria;
    
    return (
      <div className="space-y-4 p-4 rounded-lg bg-muted/30 border">
        <div>
          <label className="text-sm font-medium flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            {attribute.label}
            <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-600 border-purple-500/20">
              <Brain className="w-3 h-3 mr-1" />
              AI Evaluated
            </Badge>
          </label>
          <p className="text-xs text-muted-foreground mt-1">{attribute.description}</p>
        </div>
        <Textarea
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={attribute.placeholder || "Enter your response..."}
          className="min-h-[120px]"
          data-testid={`text-${attribute.id}`}
        />
        <RubricPreview criteria={rubricCriteria} />
      </div>
    );
  }

  if (attribute.type === "essay") {
    const strValue = typeof value === 'string' ? value : "";
    const rubricCriteria = attribute.rubricCriteria || defaultRubricCriteria;
    
    return (
      <div className="space-y-4 p-4 rounded-lg bg-muted/30 border">
        <div>
          <label className="text-sm font-medium flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            {attribute.label}
            <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-600 border-purple-500/20">
              <Brain className="w-3 h-3 mr-1" />
              AI Evaluated
            </Badge>
          </label>
          <p className="text-xs text-muted-foreground mt-1">{attribute.description}</p>
        </div>
        {attribute.richText ? (
          <RichTextEditor
            content={strValue}
            onChange={(content) => onChange(content)}
            placeholder={attribute.placeholder || "Enter your detailed response..."}
            minWords={attribute.minWords}
            maxWords={attribute.maxWords}
          />
        ) : (
          <Textarea
            value={strValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={attribute.placeholder || "Enter your detailed response..."}
            className="min-h-[200px]"
            data-testid={`essay-${attribute.id}`}
          />
        )}
        <RubricPreview criteria={rubricCriteria} />
      </div>
    );
  }

  return null;
}

function RubricPreview({ criteria }: { criteria: RubricCriterion[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="bg-purple-500/5 rounded-lg border border-purple-500/20 p-3 space-y-2">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-xs font-medium text-purple-600 w-full"
        type="button"
        data-testid="button-toggle-rubric"
      >
        <Brain className="w-3 h-3" />
        <span>How Your Response Will Be Scored</span>
        <span className="ml-auto text-xs">{isExpanded ? "Hide" : "Show Rubric"}</span>
      </button>
      {isExpanded && (
        <div className="space-y-3 pt-2 border-t border-purple-500/20">
          <p className="text-xs text-muted-foreground">
            Your written response will be evaluated by AI on the following criteria:
          </p>
          <div className="grid gap-2">
            {criteria.map((criterion) => (
              <div key={criterion.id} className="flex items-start gap-3 p-2 rounded bg-background/50">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{criterion.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {criterion.maxPoints} pts
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{criterion.description}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground border-t border-purple-500/20 pt-2">
            <strong>Total possible:</strong> {criteria.reduce((sum, c) => sum + c.maxPoints, 0)} points
          </p>
        </div>
      )}
    </div>
  );
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
                    <CharacterNameLink name={perspective.role} className="text-sm" />
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
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  Decision Rationale <span className="text-destructive">*</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Explain your strategy and cite research sources using the 3-letter source codes (e.g., AIM, APX).</p>
                    </TooltipContent>
                  </Tooltip>
                </label>
                <span className={`text-xs ${isRationaleValid ? 'text-success' : 'text-muted-foreground'}`}>
                  {wordCount} / {MINIMUM_WORDS} words minimum
                </span>
              </div>
              
              <SourceCodeReference />
              
              <div className="bg-accent/10 rounded-md p-3 border border-accent/20">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Include source references:</strong> Cite your research materials using the source codes above.
                </p>
                <p className="text-xs text-muted-foreground mt-1 italic">
                  Example: "Based on the 72% Gen Z management resistance statistic (APX), we recommend creating dual career tracks (WFT)."
                </p>
              </div>
              
              <Textarea
                placeholder={`Explain your reasoning for these choices in at least ${MINIMUM_WORDS} words. Include source codes (e.g., AIM, APX) to cite your research...`}
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
  const [showAdvisorPicker, setShowAdvisorPicker] = useState(false);

  const { data: team, isLoading: teamLoading } = useQuery<Team>({
    queryKey: ["/api/team"],
  });
  const simulationLocked = (team as any)?.simulationLocked === true;

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
        description: "View your results and feedback...",
      });
      navigate("/week-results");
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
      <div className="flex flex-col items-center justify-center h-full p-8" data-testid="decisions-page">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Unable to load decisions</h2>
        <p className="text-muted-foreground text-center max-w-md">
          There was an error loading the decision interface.
        </p>
      </div>
    );
  }

  if (simulationLocked) {
    return (
      <div className="p-6 space-y-6" data-testid="decisions-page">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Weekly Decisions</h1>
            <p className="text-muted-foreground">
              Week {team.currentWeek} of {team.totalWeeks}
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
              <h2 className="text-xl font-semibold">Decisions Not Yet Open</h2>
              <p className="text-muted-foreground max-w-md">
                Your instructor hasn't opened decision submissions yet. In the meantime, you can explore the briefing, review the company data, and read the intel articles to prepare.
              </p>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" asChild>
                  <Link href="/briefing">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Read Briefing
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard">
                    <Home className="mr-2 h-4 w-4" />
                    View Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
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
        {/* Navigation breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1">
            <Home className="w-3 h-3" />
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/research" className="hover:text-foreground transition-colors flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            Research
          </Link>
          <span>/</span>
          <Link href="/briefing" className="hover:text-foreground transition-colors flex items-center gap-1">
            <Newspaper className="w-3 h-3" />
            Briefing
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">Decisions</span>
        </div>

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
          {team && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() => setShowAdvisorPicker(true)}
                  className="gap-2"
                  data-testid="button-phone-advisor"
                >
                  <Phone className="w-4 h-4" />
                  Phone an Advisor
                  <Badge variant="secondary" className="ml-1">
                    {team.advisorCreditsRemaining ?? 3}
                  </Badge>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>You only have {team.advisorCreditsRemaining ?? 3} advisor calls for the entire simulation — use them wisely!</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {showAdvisorPicker && (
          <AdvisorPicker
            isOpen={showAdvisorPicker}
            onClose={() => setShowAdvisorPicker(false)}
            creditsRemaining={team.advisorCreditsRemaining ?? 3}
          />
        )}

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
                    Decision {currentStep + 1} of {allDecisions.length} — complete all to advance
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
                              <CharacterNameLink name={perspective.role} className="text-sm" />
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
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium flex items-center gap-2">
                            Decision Rationale <span className="text-destructive">*</span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>Explain your strategy and cite research sources using the 3-letter source codes (e.g., AIM, APX).</p>
                              </TooltipContent>
                            </Tooltip>
                          </label>
                          <span className={`text-xs ${isRationaleValid ? 'text-success' : 'text-muted-foreground'}`}>
                            {wordCount} / {MINIMUM_WORDS} words minimum
                          </span>
                        </div>
                        
                        <SourceCodeReference />
                        
                        <div className="bg-accent/10 rounded-md p-3 border border-accent/20">
                          <p className="text-xs text-muted-foreground">
                            <strong className="text-foreground">Include source references:</strong> Cite your research materials using the source codes above.
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            Example: "Based on the 72% Gen Z management resistance statistic (APX), we recommend creating dual career tracks (WFT)."
                          </p>
                        </div>
                        
                        <Textarea
                          placeholder={`Explain your reasoning for this decision in at least ${MINIMUM_WORDS} words. Include source codes (e.g., AIM, APX) to cite your research...`}
                          value={currentRationale}
                          onChange={(e) => setRationales(prev => ({ ...prev, [currentDecision.id]: e.target.value }))}
                          className={`resize-none ${!isRationaleValid && wordCount > 0 ? 'border-warning' : ''}`}
                          rows={5}
                          data-testid="input-rationale"
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
    <div className="p-6 space-y-6 max-w-4xl mx-auto" data-testid="decisions-page">
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
