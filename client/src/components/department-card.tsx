import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Cpu, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2,
  Zap 
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Department } from "@shared/schema";

interface DepartmentCardProps {
  department: Department;
  onDeploy?: () => void;
  isDeploying?: boolean;
  aiBudget: number;
  estimatedCost: number;
}

export function DepartmentCard({
  department,
  onDeploy,
  isDeploying,
  aiBudget,
  estimatedCost,
}: DepartmentCardProps) {
  const canAfford = aiBudget >= estimatedCost;
  const isDeployed = department.deployed;

  const getRiskColor = (risk: number) => {
    if (risk <= 15) return "text-success";
    if (risk <= 25) return "text-warning";
    return "text-destructive";
  };

  const getRiskLabel = (risk: number) => {
    if (risk <= 15) return "Low";
    if (risk <= 25) return "Medium";
    return "High";
  };

  return (
    <Card className={cn(
      "transition-all",
      isDeployed && "border-success/50 bg-success/5"
    )} data-testid={`department-card-${department.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md",
              isDeployed ? "bg-success/20 text-success" : "bg-primary/10 text-primary"
            )}>
              {isDeployed ? <CheckCircle2 className="h-4 w-4" /> : <Cpu className="h-4 w-4" />}
            </div>
            <CardTitle className="text-base font-semibold">{department.name}</CardTitle>
          </div>
          {isDeployed && (
            <Badge variant="outline" className="text-success border-success/30">
              Deployed
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{department.aiOption}</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              Revenue Impact
            </div>
            <div className="text-sm font-mono font-semibold text-success">
              +${(department.revenueBoost / 1000).toFixed(0)}K
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {department.jobImpact >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              Job Impact
            </div>
            <div className={cn(
              "text-sm font-mono font-semibold",
              department.jobImpact >= 0 ? "text-success" : "text-destructive"
            )}>
              {department.jobImpact > 0 ? "+" : ""}{department.jobImpact}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <AlertTriangle className="h-3 w-3" />
              Risk Level
            </div>
            <span className={cn("font-medium", getRiskColor(department.risk))}>
              {getRiskLabel(department.risk)} ({department.risk}%)
            </span>
          </div>
          <Progress value={department.risk} className="h-1.5" />
        </div>

        {!isDeployed && (
          <div className="pt-2 border-t space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Estimated Cost</span>
              <span className={cn(
                "font-mono font-semibold",
                canAfford ? "text-foreground" : "text-destructive"
              )}>
                ${(estimatedCost / 1000).toFixed(0)}K
              </span>
            </div>
            <Button
              className="w-full"
              onClick={onDeploy}
              disabled={!canAfford || isDeploying}
              data-testid={`deploy-${department.id}`}
            >
              {isDeploying ? (
                <>
                  <Zap className="h-4 w-4 mr-2 animate-pulse" />
                  Deploying...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Deploy AI
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
