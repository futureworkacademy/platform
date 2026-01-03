import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BriefingArticle as BriefingArticleType } from "@shared/schema";

interface BriefingArticleProps {
  article: BriefingArticleType;
  isRead?: boolean;
  onRead?: () => void;
}

export function BriefingArticle({ article, isRead, onRead }: BriefingArticleProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "ai":
        return "bg-accent/10 text-accent border-accent/20";
      case "trade":
        return "bg-warning/10 text-warning border-warning/20";
      case "workforce":
        return "bg-success/10 text-success border-success/20";
      case "technology":
        return "bg-primary/10 text-primary border-primary/20";
      case "policy":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card
      className={cn(
        "transition-all cursor-pointer hover-elevate",
        isRead && "opacity-60"
      )}
      onClick={onRead}
      data-testid={`briefing-article-${article.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <Badge variant="outline" className={cn("text-xs capitalize", getCategoryColor(article.category))}>
              {article.category}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground">{article.source}</span>
        </div>
        <CardTitle className="text-base font-semibold leading-tight mt-2">
          {article.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {article.content}
        </p>
        <div className="border-t pt-3">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-warning" />
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Key Insights
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {article.insights.map((insight, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {insight}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
