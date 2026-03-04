import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TrendingUp, TrendingDown, Minus, Trophy, Medal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@shared/schema";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentTeamId?: string;
}

export function LeaderboardTable({ entries, currentTeamId }: LeaderboardTableProps) {
  const getRankChange = (entry: LeaderboardEntry) => {
    if (!entry.previousRank) return null;
    const change = entry.previousRank - entry.rank;
    if (change > 0) return { direction: "up" as const, value: change };
    if (change < 0) return { direction: "down" as const, value: Math.abs(change) };
    return { direction: "stable" as const, value: 0 };
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return null;
  };

  const getTeamInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getTeamColor = (index: number) => {
    const colors = [
      "bg-primary",
      "bg-accent",
      "bg-success",
      "bg-warning",
      "bg-destructive",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="rounded-md border" data-testid="leaderboard-table">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16 text-center">Rank</TableHead>
            <TableHead>Team</TableHead>
            <TableHead className="text-right">Financial Score</TableHead>
            <TableHead className="text-right">Cultural Score</TableHead>
            <TableHead className="text-right">Combined</TableHead>
            <TableHead className="text-center w-24">Week</TableHead>
            <TableHead className="text-center w-20">Change</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry, index) => {
            const rankChange = getRankChange(entry);
            const isCurrentTeam = entry.teamId === currentTeamId;

            return (
              <TableRow
                key={entry.teamId}
                className={cn(
                  "transition-colors",
                  isCurrentTeam && "bg-primary/5",
                  index % 2 === 0 && !isCurrentTeam && "bg-muted/30"
                )}
                data-testid={`leaderboard-row-${entry.teamId}`}
              >
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    {getRankIcon(entry.rank) || (
                      <span className="font-mono font-bold text-lg">
                        {entry.rank}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className={cn("h-8 w-8", getTeamColor(index))}>
                      <AvatarFallback className="text-xs font-bold text-white bg-transparent">
                        {getTeamInitials(entry.teamName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{entry.teamName}</span>
                      {isCurrentTeam && (
                        <Badge variant="secondary" className="w-fit text-xs mt-0.5">
                          Your Team
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-mono font-semibold text-primary">
                    {entry.financialScore.toFixed(2)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-mono font-semibold text-success">
                    {entry.culturalScore.toFixed(2)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-mono font-bold text-lg">
                    {entry.combinedScore.toFixed(2)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="font-mono">
                    W{entry.currentWeek}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {rankChange && (
                    <div
                      className={cn(
                        "flex items-center justify-center gap-1",
                        rankChange.direction === "up" && "text-success",
                        rankChange.direction === "down" && "text-destructive",
                        rankChange.direction === "stable" && "text-muted-foreground"
                      )}
                    >
                      {rankChange.direction === "up" && (
                        <>
                          <TrendingUp className="h-4 w-4" />
                          <span className="font-mono text-sm">+{rankChange.value}</span>
                        </>
                      )}
                      {rankChange.direction === "down" && (
                        <>
                          <TrendingDown className="h-4 w-4" />
                          <span className="font-mono text-sm">-{rankChange.value}</span>
                        </>
                      )}
                      {rankChange.direction === "stable" && (
                        <Minus className="h-4 w-4" />
                      )}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
