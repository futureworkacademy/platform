import { cn } from "@/lib/utils";

interface ScoreGaugeProps {
  label: string;
  value: number;
  maxValue?: number;
  color?: "primary" | "success" | "warning" | "danger" | "accent";
  size?: "sm" | "md" | "lg";
}

export function ScoreGauge({
  label,
  value,
  maxValue = 100,
  color = "primary",
  size = "md",
}: ScoreGaugeProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);

  const getColorClass = () => {
    switch (color) {
      case "success":
        return "bg-success";
      case "warning":
        return "bg-warning";
      case "danger":
        return "bg-destructive";
      case "accent":
        return "bg-accent";
      default:
        return "bg-primary";
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "h-2";
      case "lg":
        return "h-4";
      default:
        return "h-3";
    }
  };

  const getValueColor = () => {
    if (percentage >= 70) return "text-success";
    if (percentage >= 40) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className={cn("text-sm font-mono font-bold", getValueColor())}>
          {value.toFixed(1)}%
        </span>
      </div>
      <div className={cn("w-full bg-muted rounded-full overflow-hidden", getSizeClass())}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            getColorClass()
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
