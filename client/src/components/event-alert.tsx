import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GlobalEvent } from "@shared/schema";

interface EventAlertProps {
  event: GlobalEvent;
  lobbyingBudget: number;
  onMitigate?: () => void;
  onSkip?: () => void;
  isMitigating?: boolean;
}

export function EventAlert({
  event,
  lobbyingBudget,
  onMitigate,
  onSkip,
  isMitigating,
}: EventAlertProps) {
  const mitigationCost = 10000;
  const canAfford = lobbyingBudget >= mitigationCost;

  const isNegativeEvent = Object.values(event.impact).some((v) => v !== undefined && v < 0);
  const isPositiveEvent = Object.values(event.impact).every((v) => v === undefined || v >= 0);

  return (
    <Card className={cn(
      "border-2 animate-fade-in",
      isNegativeEvent && "border-destructive/50 bg-destructive/5",
      isPositiveEvent && "border-success/50 bg-success/5"
    )} data-testid="event-alert">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            isNegativeEvent && "bg-destructive/20 text-destructive",
            isPositiveEvent && "bg-success/20 text-success"
          )}>
            {isNegativeEvent ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <Zap className="h-5 w-5" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-lg font-semibold">
                {event.name}
              </CardTitle>
              <Badge variant={isNegativeEvent ? "destructive" : "default"} className="text-xs">
                Global Event
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {event.description}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {event.impact.revenue !== undefined && (
            <div className="text-center p-3 rounded-md bg-muted/50">
              <div className="text-xs text-muted-foreground mb-1">Revenue</div>
              <div className={cn(
                "text-sm font-mono font-semibold flex items-center justify-center gap-1",
                event.impact.revenue >= 0 ? "text-success" : "text-destructive"
              )}>
                {event.impact.revenue >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {event.impact.revenue >= 0 ? "+" : ""}{(event.impact.revenue * 100).toFixed(0)}%
              </div>
            </div>
          )}
          {event.impact.morale !== undefined && (
            <div className="text-center p-3 rounded-md bg-muted/50">
              <div className="text-xs text-muted-foreground mb-1">Morale</div>
              <div className={cn(
                "text-sm font-mono font-semibold flex items-center justify-center gap-1",
                event.impact.morale >= 0 ? "text-success" : "text-destructive"
              )}>
                {event.impact.morale >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {event.impact.morale >= 0 ? "+" : ""}{event.impact.morale}
              </div>
            </div>
          )}
          {event.impact.employees !== undefined && (
            <div className="text-center p-3 rounded-md bg-muted/50">
              <div className="text-xs text-muted-foreground mb-1">Employees</div>
              <div className={cn(
                "text-sm font-mono font-semibold flex items-center justify-center gap-1",
                event.impact.employees >= 0 ? "text-success" : "text-destructive"
              )}>
                {event.impact.employees >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {event.impact.employees >= 0 ? "+" : ""}{event.impact.employees}
              </div>
            </div>
          )}
        </div>

        {isNegativeEvent && (
          <div className="flex items-center justify-between p-3 rounded-md bg-muted/50 border">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <div>
                <div className="text-sm font-medium">Lobbying Mitigation</div>
                <div className="text-xs text-muted-foreground">
                  Reduce negative impacts by 50% (Cost: ${(mitigationCost / 1000).toFixed(0)}K)
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onSkip}
                disabled={isMitigating}
                data-testid="event-skip"
              >
                Skip
              </Button>
              <Button
                size="sm"
                onClick={onMitigate}
                disabled={!canAfford || isMitigating}
                data-testid="event-mitigate"
              >
                {isMitigating ? "Processing..." : "Mitigate"}
              </Button>
            </div>
          </div>
        )}

        {isPositiveEvent && (
          <div className="text-center text-sm text-success">
            This event has positive effects on your company!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
