import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface InfoTooltipProps {
  content: string;
  className?: string;
  iconSize?: number;
  side?: "top" | "right" | "bottom" | "left";
}

export function InfoTooltip({ 
  content, 
  className,
  iconSize = 14,
  side = "top"
}: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button 
          type="button"
          className={cn(
            "inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-help",
            className
          )}
          data-testid="button-info-tooltip"
        >
          <HelpCircle style={{ width: iconSize, height: iconSize }} />
        </button>
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs text-sm">
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

export const TOOLTIP_CONTENT = {
  financialScore: "Measures profitability, debt management, and automation ROI. Based on revenue growth, debt-to-equity ratio (<40% target), and cash flow health.",
  culturalHealth: "Tracks employee morale, workforce adaptability, and engagement. Affected by layoff decisions, reskilling investment, and communication quality.",
  difficultyAdvanced: "Advanced difficulty: 8-week simulation, 17+ stakeholders, 4-criteria rubrics, strict evaluation. Designed for MBA/Graduate level programs.",
  difficultyStandard: "Standard difficulty: 6-week simulation, 12-14 stakeholders, 3-criteria rubrics. Balanced for executive education and corporate training.",
  difficultyIntroductory: "Introductory difficulty: 4-week simulation, 8-10 stakeholders, 2-criteria rubrics. Forgiving evaluation for undergraduate students.",
  intelEngagementBonus: "Read optional Industry Intelligence articles to boost your research score. Base: 1.0x, +0.15x per article viewed, maximum: 1.5x multiplier.",
  automationROI: "Return on automation investment = (labor savings + productivity gains) / investment cost. Target: 18-24 month payback period.",
  unionSentiment: "At 75%+ sentiment, workers will vote to unionize, changing available decision options. Increases with layoffs, decreases with reskilling investment.",
  phoneAFriend: "3 lifetime advisor uses per simulation. Each advisor specializes in different areas (Finance, HR, Legal, etc.). Choose strategically!",
  rubricReasoningDepth: "Evaluates quality of strategic analysis and long-term thinking. 30% of essay score.",
  rubricStakeholder: "Assesses awareness of key stakeholder perspectives and competing interests. 25% of essay score.",
  rubricImplementation: "Evaluates practical execution planning and resource considerations. 25% of essay score.",
  rubricRiskAwareness: "Measures identification of potential challenges and mitigation strategies. 20% of essay score.",
  morale: "Employee satisfaction (0-100). Falls below 30% triggers mass resignation crisis. Affected by layoffs, communication, and reskilling investment.",
  managementBench: "Pipeline health for future managers (0-100). Decreases when Gen Z workers refuse management roles or experienced managers retire.",
  reskillingProgress: "Workforce training completion (0-100). Higher progress improves adaptability and reduces anxiety about automation.",
  easterEggBonus: "Hidden bonus points awarded for exceptional stakeholder consideration or creative problem-solving approaches.",
  weeklyDecisionWeight: "Decisions later in the simulation carry more weight as consequences compound over time.",
  contentViewTracking: "Your reading progress is tracked across sessions. You can resume where you left off."
} as const;

export type TooltipKey = keyof typeof TOOLTIP_CONTENT;
